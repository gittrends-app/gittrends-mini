import { Metadata, Repository, Stargazer } from '../entities';
import HttpClient from '../github/HttpClient';
import { GitHubService } from './GithubService';
import { LocalService, ServiceOpts } from './LocalService';
import { Iterable, Service } from './Service';

export class ProxyService implements Service {
  private readonly cacheService: LocalService;
  private readonly githubService: GitHubService;
  private readonly persistence;

  constructor(tokenOrClient: string | HttpClient, opts: ServiceOpts) {
    this.cacheService = new LocalService((this.persistence = opts));
    this.githubService = new GitHubService(tokenOrClient);
  }

  async find(name: string): Promise<Repository | undefined> {
    const cachedRepo = await this.cacheService.find(name);
    if (cachedRepo) return cachedRepo;

    const repo = await this.githubService.find(name);
    if (repo) await this.persistence.repositories.save(repo);

    return repo;
  }

  stargazers(id: string, opts?: { endCursor?: string }): Iterable<Stargazer[] | undefined> & { cacheHit?: boolean } {
    const self = this;

    let iterator = this.githubService.stargazers(id, opts);
    const cachedIterator = this.cacheService.stargazers(id);

    let skipCache = opts?.endCursor !== undefined;

    return {
      [Symbol.iterator]() {
        return this;
      },
      async next() {
        if (!skipCache && (this.cacheHit === undefined || this.cacheHit === true)) {
          if (this.cacheHit === undefined) {
            const meta = (await self.persistence.metadata.findByRepository(id, 'stargazers')).at(0);

            this.cacheHit = meta ? true : false;
            iterator = self.githubService.stargazers(id, { endCursor: meta?.end_cursor });
          }

          if (this.cacheHit === true) {
            const { done, value, endCursor } = await cachedIterator.next();
            if (!done) return { done: false, value, endCursor };
          }

          skipCache = true;
        }

        const { done, value, endCursor } = await iterator.next();

        if (value) {
          await self.persistence.stargazers.save(value);
          await self.persistence.metadata.save(
            new Metadata({
              repository: id,
              end_cursor: endCursor as string,
              resource: 'stargazers',
              updated_at: new Date(),
            }),
          );
        }

        return { done, value };
      },
    };
  }
}

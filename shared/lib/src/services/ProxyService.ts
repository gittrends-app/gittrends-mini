import { Repository, Stargazer } from '../entities';
import { GitHubService } from './GithubService';
import { LocalService } from './LocalService';
import { Iterable, Service } from './Service';

export class ProxyService implements Service {
  private readonly cacheService: LocalService;
  private readonly githubService: GitHubService;
  private readonly persistence;

  constructor(token: string, opts: { persistence: LocalService['persistence'] }) {
    this.cacheService = new LocalService(opts);
    this.githubService = new GitHubService(token);
    this.persistence = opts.persistence;
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

    let skipCache = false;

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

        if (value) await self.persistence.stargazers.save(value, { repository: id, endCursor: endCursor as string });

        return { done, value };
      },
    };
  }
}

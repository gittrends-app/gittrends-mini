import { Repository, Stargazer } from '../../types';
import { CacheService } from './CacheService';
import { GitHubService } from './GithubService';
import { Iterable, Service } from './Service';

export class ProxyService implements Service {
  private cacheService: CacheService;
  private githubService: GitHubService;

  constructor(token: string) {
    this.cacheService = new CacheService();
    this.githubService = new GitHubService(token);
  }

  async find(name: string): Promise<Repository | null> {
    const cachedRepo = await this.cacheService.find(name);
    if (cachedRepo) cachedRepo;

    const repo = await this.githubService.find(name);
    if (repo) await this.cacheService.saveRepository([repo]);

    return repo;
  }

  stargazers(id: string): Iterable<Stargazer[]> & { cacheHit?: boolean } {
    const self = this;

    const iterator = this.githubService.stargazers(id);
    const cachedIterator = this.cacheService.stargazers(id);

    let skipCache = false;

    return {
      [Symbol.iterator]() {
        return this;
      },
      hasNext: iterator.hasNext,
      async next() {
        if (!skipCache && (this.cacheHit === undefined || this.cacheHit === true)) {
          if (this.cacheHit === undefined) {
            const meta = await self.cacheService.getMetadata(id, 'stargazers').catch(() => null);

            if (meta) {
              this.cacheHit = true;
              this.endCursor = iterator.endCursor = meta.end_cursor;
            } else {
              this.cacheHit = false;
            }
          }

          if (this.cacheHit === true) {
            const { done, value } = await cachedIterator.next();
            if (!done) return { done: false, value };
          }

          skipCache = true;
        }

        const { done, value } = await iterator.next();

        this.endCursor = iterator.endCursor;

        if (value)
          await Promise.all([
            self.cacheService.saveStargazers(id, value),
            self.cacheService.saveMetadata({
              repository: id,
              resource: 'stargazers',
              end_cursor: iterator.endCursor,
              has_next_page: iterator.hasNext(),
            }),
          ]);

        return { done, value };
      },
    };
  }
}

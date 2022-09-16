import { Metadata, Repository, RepositoryResource } from '../entities';
import HttpClient from '../github/HttpClient';
import { IResourceRepository } from '../repos';
import { Constructor } from '../types';
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

  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string | undefined }[],
  ): Iterable {
    return new ProxiedIterator(repositoryId, resources, {
      github: this.githubService,
      local: this.cacheService,
      repos: this.persistence,
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    const cachedRepo = await this.cacheService.find(name);
    if (cachedRepo) return cachedRepo;

    const repo = await this.githubService.find(name);
    if (repo) await this.persistence.repositories.save(repo);

    return repo;
  }
}

class ProxiedIterator implements Iterable {
  private localIterables?: Iterable;
  private githubIterables?: Iterable;
  private done = false;

  constructor(
    private repositoryId: string,
    private resources: { resource: Constructor<RepositoryResource>; endCursor?: string | undefined }[],
    private opts: { local: LocalService; github: GitHubService; repos: ServiceOpts },
  ) {}

  [Symbol.asyncIterator](): AsyncIterableIterator<{ items: RepositoryResource[]; endCursor?: string }[]> {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string }[]>> {
    if (this.done) return Promise.resolve({ done: true, value: undefined });

    const cachedResourcesIndexes = this.resources
      .reduce((memo: (number | null)[], res, index) => memo.concat([!res.endCursor ? index : null]), [])
      .filter((v) => v !== null) as number[];

    if (!this.localIterables && !this.githubIterables) {
      this.localIterables = this.opts.local.resources(
        this.repositoryId,
        this.resources.filter((_, index) => cachedResourcesIndexes.includes(index)),
      );

      const metas = await this.opts.repos.metadata.findByRepository(this.repositoryId);

      this.githubIterables = this.opts.github.resources(
        this.repositoryId,
        this.resources.map((res) => ({
          ...res,
          endCursor: metas.find((m) => m.resource === (res.resource as any).__collection_name)?.end_cursor,
        })),
      );
    }

    if (!this.localIterables || !this.githubIterables) throw new Error('Unknown error on ProxyServer class');

    const [cachedResults, githubResults] = await Promise.all([this.localIterables.next(), this.githubIterables.next()]);

    if (githubResults.value) {
      for (let index = 0; index < githubResults.value.length; index++) {
        const result = (githubResults.value as { items: RepositoryResource[]; endCursor?: string }[])[index];

        const repository: IResourceRepository<RepositoryResource> = (this.opts.repos as any)[
          (this.resources[index].resource as any).__collection_name
        ];

        await repository.save(result.items).then(() =>
          this.opts.repos.metadata.save(
            new Metadata({
              repository: this.repositoryId,
              end_cursor: result.endCursor ? `${result.endCursor}` : undefined,
              resource: (this.resources[index].resource as any).__collection_name,
              updated_at: new Date(),
            }),
          ),
        );
      }
    }

    if (cachedResults.done && githubResults.done) return { done: (this.done = true), value: undefined };
    else if (cachedResults.done) return githubResults;
    else if (githubResults.done) githubResults.value = new Array(this.resources.length);

    cachedResourcesIndexes.forEach((ghrIndex, crIndex) => {
      if (!githubResults.value[ghrIndex]) githubResults.value[ghrIndex] = cachedResults.value;
      else
        githubResults.value[ghrIndex].items = [
          ...(githubResults.value?.[ghrIndex]?.items || []),
          ...(cachedResults.value?.[crIndex]?.items || []),
        ] as any;
    });

    return githubResults;
  }
}

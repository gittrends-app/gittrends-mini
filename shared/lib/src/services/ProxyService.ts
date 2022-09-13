import { Metadata, Release, Repository, Stargazer, Tag } from '../entities';
import HttpClient from '../github/HttpClient';
import { IMetadataRepository, IReleasesRepository, IStargazersRepository, ITagsRepository } from '../repos';
import { GitHubService } from './GithubService';
import { LocalService, ServiceOpts } from './LocalService';
import { EntityConstructor, Iterable, Service, TIterableResourceResult } from './Service';

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
    resources: { resource: EntityConstructor; endCursor?: string | undefined }[],
  ): Iterable {
    return new ProxiedIterator(repositoryId, resources, {
      github: this.githubService,
      local: this.cacheService,
      metadataRepo: this.persistence.metadata,
      stargazersRepo: this.persistence.stargazers,
      tagsRepo: this.persistence.tags,
      releasesRepo: this.persistence.releases,
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
  private done: boolean = false;

  constructor(
    private repositoryId: string,
    private resources: { resource: EntityConstructor; endCursor?: string | undefined }[],
    private opts: {
      local: LocalService;
      github: GitHubService;
      metadataRepo: IMetadataRepository;
      stargazersRepo: IStargazersRepository;
      tagsRepo: ITagsRepository;
      releasesRepo: IReleasesRepository;
    },
  ) {}

  [Symbol.asyncIterator](): AsyncIterableIterator<TIterableResourceResult> {
    return this;
  }

  async next(): Promise<IteratorResult<TIterableResourceResult>> {
    if (this.done) return Promise.resolve({ done: true, value: undefined });

    const cachedResources = this.resources.filter((res) => !res.endCursor);

    if (!this.localIterables && !this.githubIterables) {
      this.localIterables = this.opts.local.resources(this.repositoryId, cachedResources);

      const metas = await this.opts.metadataRepo.findByRepository(this.repositoryId);

      this.githubIterables = this.opts.github.resources(
        this.repositoryId,
        this.resources.map((res) => {
          let resource: string;
          if (res.resource === Stargazer) resource = 'stargazers';
          else if (res.resource === Tag) resource = 'tags';
          else if (res.resource === Release) resource = 'releases';
          return { ...res, endCursor: metas.find((m) => m.resource === resource)?.end_cursor };
        }),
      );
    }

    if (!this.localIterables || !this.githubIterables) throw new Error('Unknown error on ProxyServer class');

    const [cachedResults, githubResults] = await Promise.all([this.localIterables.next(), this.githubIterables.next()]);

    if (githubResults.value) {
      for (let index = 0; index < githubResults.value.length; index++) {
        const result = (githubResults.value as TIterableResourceResult)[index];
        let resource: 'stargazers' | 'tags' | 'releases';

        switch (this.resources[index].resource) {
          case Stargazer: {
            await this.opts.stargazersRepo.save(result.items as Stargazer[]);
            resource = 'stargazers';
            break;
          }
          case Tag: {
            await this.opts.tagsRepo.save(result.items as Tag[]);
            resource = 'tags';
            break;
          }
          case Release: {
            await this.opts.releasesRepo.save(result.items as Release[]);
            resource = 'tags';
            break;
          }
          default:
            throw new Error('TODO');
        }

        await this.opts.metadataRepo.save(
          new Metadata({
            repository: this.repositoryId,
            end_cursor: result.endCursor ? `${result.endCursor}` : undefined,
            resource: resource,
            updated_at: new Date(),
          }),
        );
      }
    }

    if (cachedResults.done && githubResults.done) this.done = true;

    cachedResources.forEach((cr) => {
      const index = this.resources.findIndex((r) => r.resource === cr.resource);
      githubResults.value[index].items = [...githubResults.value[index].items, ...cachedResults.value[index].items];
    });

    return githubResults;
  }
}

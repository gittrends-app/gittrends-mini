import { each } from 'bluebird';

import { HttpClient } from '@gittrends/github';

import { Actor, Metadata, Repository, RepositoryResource } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { GitHubService } from './GithubService';
import { LocalService, ServiceOpts } from './LocalService';
import { IResourceRepository } from './Repositories';
import { Iterable, Service } from './Service';

const logger = debug('services:proxy');

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
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string; hasNextPage?: boolean }[],
    opts?: { persistenceBatchSize?: number | Record<string, number>; ignoreCache?: boolean },
  ): Iterable<RepositoryResource> {
    logger(`Creating ProxiedIterator for ${repositoryId} (${resources.map((r) => r.resource.name).join(', ')})`);
    return new ProxiedIterator(repositoryId, resources, {
      github: this.githubService,
      local: this.cacheService,
      repos: this.persistence,
      ignoreCache: opts?.ignoreCache,
      persistenceBatchSize: opts?.persistenceBatchSize,
    });
  }

  async get(id: string, opts: { noCache: boolean } = { noCache: false }): Promise<Repository | undefined> {
    return this.generic('get', id, opts);
  }

  async getActor(id: string, opts?: { noCache: boolean }): Promise<Actor | undefined> {
    if (opts?.noCache !== true) {
      const cachedActor = await this.cacheService.getActor(id);
      if (cachedActor) return cachedActor;
    }

    const actor = await this.githubService.getActor(id);
    if (actor) await this.persistence.actors.upsert(actor);

    return actor;
  }

  async find(name: string, opts: { noCache: boolean } = { noCache: false }): Promise<Repository | undefined> {
    return this.generic('find', name, opts);
  }

  private async generic(
    op: 'find' | 'get',
    value: string,
    opts: { noCache: boolean } = { noCache: false },
  ): Promise<Repository | undefined> {
    logger(`${op === 'find' ? 'Finding' : 'Getting'} repository ${value} (noCache: ${opts.noCache})...`);
    if (opts.noCache === false) {
      const cachedRepo = await this.cacheService?.[op](value);
      if (cachedRepo) return cachedRepo;
    }

    const repo = await this.githubService?.[op](value);
    if (repo) {
      await this.persistence.repositories
        .save(repo)
        .then(() =>
          this.persistence.metadata.save(
            new Metadata({ repository: repo.id, resource: Repository.__collection_name, updated_at: new Date() }),
          ),
        );
    }

    return repo;
  }
}

class ProxiedIterator implements Iterable<RepositoryResource> {
  private localIterables?: Iterable<RepositoryResource>;
  private githubIterables?: Iterable<RepositoryResource>;
  private done = false;
  private resourcesBatch: { items: RepositoryResource[]; endCursor?: string }[];

  constructor(
    private repositoryId: string,
    private resources: { resource: Constructor<RepositoryResource>; endCursor?: string; hasNextPage?: boolean }[],
    private opts: {
      local: LocalService;
      github: GitHubService;
      repos: ServiceOpts;
      persistenceBatchSize?: number | Record<string, number>;
      ignoreCache?: boolean;
    },
  ) {
    this.resourcesBatch = resources.map(() => ({ items: [] }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string; hasNextPage?: boolean }[]>> {
    logger(`Requesting next page ... has already done? ${this.done}`);

    if (this.done) return Promise.resolve({ done: true, value: undefined });

    const cachedResourcesIndexes = this.opts.ignoreCache
      ? []
      : (this.resources
          .reduce((memo: (number | null)[], res, index) => memo.concat([!res.endCursor ? index : null]), [])
          .filter((v) => v !== null) as number[]);

    if (!this.localIterables && !this.githubIterables) {
      logger('Preparing iterables (github and cached)...');
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

    if (!this.localIterables || !this.githubIterables) throw new Error('Iterators not created!');

    logger('Requesting next data from github and cached iterables...');
    const [cachedResults, githubResults] = await Promise.all([this.localIterables.next(), this.githubIterables.next()]);

    logger('Iterating over iterable results...');
    await each(
      (githubResults.value || []) as { items: RepositoryResource[]; endCursor?: string; hasNextPage: boolean }[],
      async (result, index) => {
        const persistenceBatchSize = !this.opts.persistenceBatchSize
          ? undefined
          : typeof this.opts.persistenceBatchSize === 'number'
          ? this.opts.persistenceBatchSize
          : this.opts.persistenceBatchSize[(this.resources[index].resource as any).__collection_name];

        const repository: IResourceRepository<RepositoryResource> = (this.opts.repos as any)[
          (this.resources[index].resource as any).__collection_name
        ];

        const arrayRef = this.resourcesBatch[index];
        arrayRef.items.push(...result.items);
        arrayRef.endCursor = result.endCursor;

        if (
          (persistenceBatchSize && arrayRef.items.length >= persistenceBatchSize) ||
          (!result.hasNextPage && arrayRef.items.length > 0)
        ) {
          logger(`Persisting ${arrayRef.items.length} ${(this.resources[index].resource as any).__collection_name}...`);
          await repository
            .save(arrayRef.items)
            .then(() =>
              this.opts.repos.metadata.save(
                new Metadata({
                  repository: this.repositoryId,
                  end_cursor: arrayRef.endCursor,
                  resource: (this.resources[index].resource as any).__collection_name,
                  updated_at: new Date(),
                }),
              ),
            )
            .then(() => (arrayRef.items = []));
        }
      },
    );

    if (cachedResults.done && githubResults.done) {
      logger('Iterators done, no more data to iterate...');
      return { done: (this.done = true), value: undefined };
    } else if (cachedResults.done) {
      logger('No cached results, returning github iterator result...');
      return githubResults;
    } else if (githubResults.done) {
      logger('I dont now what is it, sory :(');
      githubResults.value = new Array(this.resources.length);
    }

    logger('Merging results from github and cached iterators...');
    cachedResourcesIndexes.forEach((ghrIndex, crIndex) => {
      if (!githubResults.value[ghrIndex]) githubResults.value[ghrIndex] = cachedResults.value;
      else
        githubResults.value[ghrIndex].items = [
          ...(githubResults.value?.[ghrIndex]?.items || []),
          ...(cachedResults.value?.[crIndex]?.items || []),
        ] as any;
    });

    logger('Proxied iterating done, returning...');
    return githubResults;
  }
}

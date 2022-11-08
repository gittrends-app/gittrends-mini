import { each } from 'bluebird';
import { compact } from 'lodash';

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
    opts?: { ignoreCache?: boolean },
  ): Iterable<RepositoryResource> {
    logger(`Creating ProxiedIterator for ${repositoryId} (${resources.map((r) => r.resource.name).join(', ')})`);
    return new ProxiedIterator(repositoryId, resources, {
      github: this.githubService,
      local: this.cacheService,
      repos: this.persistence,
      ignoreCache: opts?.ignoreCache,
    });
  }

  async get(id: string, opts: { noCache: boolean } = { noCache: false }): Promise<Repository | undefined> {
    return this.generic('get', id, opts);
  }

  async getActor(id: string): Promise<Actor | undefined>;
  async getActor(ids: string[], opts?: { noCache: boolean }): Promise<(Actor | undefined)[]>;
  async getActor(id: any, opts?: { noCache: boolean }): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    const actors: Actor[] = [];

    if (opts?.noCache !== true) {
      await this.cacheService
        .getActor(ids)
        .then(compact)
        .then((_actors) => actors.push(..._actors));
    }

    const pendingIds = ids.filter((id) => !actors.find((a) => a?.id === id));

    const newActors = await this.githubService
      .getActor(pendingIds)
      .then(compact)
      .then((actors) => actors.map((actor) => Object.assign(actor, { __updated_at: new Date() })));

    if (newActors.length) {
      actors.push(...newActors);
      await this.persistence.actors.replace(newActors);
    }

    return Array.isArray(id) ? ids.map((id) => actors.find((a) => a?.id === id)) : actors.at(0);
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

  constructor(
    private repositoryId: string,
    private resources: { resource: Constructor<RepositoryResource>; endCursor?: string; hasNextPage?: boolean }[],
    private opts: {
      local: LocalService;
      github: GitHubService;
      repos: ServiceOpts;
      ignoreCache?: boolean;
    },
  ) {}

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
        const repository: IResourceRepository<RepositoryResource> = (this.opts.repos as any)[
          (this.resources[index].resource as any).__collection_name
        ];

        logger(`Persisting ${result.items.length} ${(this.resources[index].resource as any).__collection_name}...`);
        await (result.items.length > 0 ? repository.save(result.items) : Promise.resolve()).then(() => {
          const data: Partial<Metadata> = {
            repository: this.repositoryId,
            end_cursor: result.endCursor,
            resource: (this.resources[index].resource as any).__collection_name,
            updated_at: new Date(),
          };
          if (!result.hasNextPage) data.finished_at = new Date();
          return this.opts.repos.metadata.upsert(new Metadata(data));
        });
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

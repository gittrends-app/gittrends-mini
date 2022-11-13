import { Actor, RepositoryResource } from '@gittrends/entities';
import { Dependency, Issue, PullRequest, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/entities';

import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from '../Repositories';
import { Iterable, IterableRepositoryResources, Service } from '../Service';
import { ResourceIterator } from './ResourcesIterator';

export type LocalServiceOpts = {
  actors: IActorsRepository;
  repositories: IRepositoriesRepository;
  metadata: IMetadataRepository;
  stargazers?: IResourceRepository<Stargazer>;
  tags?: IResourceRepository<Tag>;
  releases?: IResourceRepository<Release>;
  watchers?: IResourceRepository<Watcher>;
  dependencies?: IResourceRepository<Dependency>;
  issues?: IResourceRepository<Issue>;
  pull_requests?: IResourceRepository<PullRequest>;
};

export class LocalService implements Service {
  private readonly persistence: LocalServiceOpts;

  constructor(opts: LocalServiceOpts) {
    this.persistence = opts;
  }

  async get(id: string): Promise<Repository | undefined> {
    return this.persistence.repositories.findById(id, { resolve: ['owner'] });
  }

  async getActor(id: string): Promise<Actor | undefined>;
  async getActor(id: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    return this.persistence.actors.findById(id);
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.persistence.repositories.findByName(name, { resolve: ['owner'] });
  }

  resources(
    repositoryId: string,
    resources: { resource: EntityConstructor<IterableRepositoryResources> }[],
  ): Iterable<RepositoryResource> {
    const iterators: Iterable<RepositoryResource>[] = resources.map((it) => {
      let repository: IResourceRepository<RepositoryResource> | undefined = undefined;
      if (it.resource === Stargazer) repository = this.persistence.stargazers;
      else if (it.resource === Tag) repository = this.persistence.tags;
      else if (it.resource === Release) repository = this.persistence.releases;
      else if (it.resource === Watcher) repository = this.persistence.watchers;
      else if (it.resource === Dependency) repository = this.persistence.dependencies;
      else if (it.resource === Issue) repository = this.persistence.issues;
      else if (it.resource === PullRequest) repository = this.persistence.pull_requests;

      if (!repository) throw new Error('Data repository is required for ' + it.resource.name);

      return new ResourceIterator(repositoryId, { repository, limit: 1000, skip: 0 });
    });

    return new ResourcesIterator(iterators);
  }
}

class ResourcesIterator implements Iterable<RepositoryResource> {
  constructor(private iterables: Iterable<RepositoryResource>[]) {}

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string; hasNextPage?: boolean }[]>> {
    if (this.iterables.length === 0) return Promise.resolve({ done: true, value: undefined });

    const results = await Promise.all(this.iterables.map((pi) => pi.next()));

    const finalResult = results.reduce(
      (memo: { items: RepositoryResource[]; endCursor?: string; hasNextPage?: boolean }[], { done, value }) =>
        done ? memo : memo.concat(value),
      [],
    );

    this.iterables = this.iterables.filter((_, index) => !results[index].done);

    return Promise.resolve({ done: false, value: finalResult });
  }
}

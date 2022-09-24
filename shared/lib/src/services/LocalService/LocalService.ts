import { Dependency, Release, Repository, Stargazer, Tag, Watcher } from '../../entities';
import { RepositoryResource } from '../../entities/interfaces/RepositoryResource';
import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from '../../repos';
import { Constructor } from '../../types';
import { Iterable, Service } from '../Service';
import { ResourceIterator } from './ResourcesIterator';

export type ServiceOpts = {
  actors: IActorsRepository;
  repositories: IRepositoriesRepository;
  metadata: IMetadataRepository;
  stargazers?: IResourceRepository<Stargazer>;
  tags?: IResourceRepository<Tag>;
  releases?: IResourceRepository<Release>;
  watchers?: IResourceRepository<Watcher>;
  dependencies?: IResourceRepository<Dependency>;
};

export class LocalService implements Service {
  private readonly persistence: ServiceOpts;

  constructor(opts: ServiceOpts) {
    this.persistence = opts;
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.persistence.repositories.findByName(name, { resolve: ['owner'] });
  }

  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource> }[],
  ): Iterable<RepositoryResource> {
    const iterators: Iterable<RepositoryResource>[] = resources.map((it) => {
      let repository: IResourceRepository<RepositoryResource> | undefined = undefined;
      if (it.resource === Stargazer) repository = this.persistence.stargazers;
      else if (it.resource === Tag) repository = this.persistence.tags;
      else if (it.resource === Release) repository = this.persistence.releases;
      else if (it.resource === Watcher) repository = this.persistence.watchers;
      else if (it.resource === Dependency) repository = this.persistence.dependencies;

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

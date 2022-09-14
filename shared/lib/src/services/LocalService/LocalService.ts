import { Release, Repository, RepositoryResource, Stargazer, Tag } from '../../entities';
import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from '../../repos';
import { Constructor } from '../../types';
import { Iterable, Service } from '../Service';
import { ResourceIterator } from './ResourcesIterator';

export type ServiceOpts = Required<{
  actors: IActorsRepository;
  repositories: IRepositoriesRepository;
  stargazers: IResourceRepository<Stargazer>;
  tags: IResourceRepository<Tag>;
  releases: IResourceRepository<Release>;
  metadata: IMetadataRepository;
}>;

export class LocalService implements Service {
  private readonly persistence: ServiceOpts;

  constructor(opts: ServiceOpts) {
    this.persistence = opts;
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.persistence.repositories.findByName(name, { resolve: ['owner'] });
  }

  resources(repositoryId: string, resources: { resource: Constructor<RepositoryResource> }[]): Iterable {
    const iterators: Iterable[] = resources.map((it) => {
      let repository: IResourceRepository<RepositoryResource> | undefined = undefined;
      if (it.resource === Stargazer) repository = this.persistence.stargazers;
      else if (it.resource === Tag) repository = this.persistence.tags;
      else if (it.resource === Release) repository = this.persistence.releases;

      if (!repository) throw new Error('Repository not found for ' + it.resource.name);

      return new ResourceIterator(repositoryId, { repository, limit: 1000, skip: 0 });
    });

    return new ResourcesIterator(iterators);
  }
}

class ResourcesIterator implements Iterable {
  constructor(private iterables: Iterable[]) {}

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string }[]>> {
    if (this.iterables.length === 0) return Promise.resolve({ done: true, value: undefined });

    const results = await Promise.all(this.iterables.map((pi) => pi.next()));

    const finalResult = results.reduce(
      (memo: { items: RepositoryResource[]; endCursor?: string }[], result) =>
        result.done ? memo : memo.concat([{ items: result.value[0]?.items, endCursor: result.value[0]?.endCursor }]),
      [],
    );

    this.iterables = this.iterables.filter((_, index) => !results[index].done);

    return Promise.resolve({ done: false, value: finalResult });
  }
}

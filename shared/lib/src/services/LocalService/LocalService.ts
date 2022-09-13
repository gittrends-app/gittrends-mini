import { Release, Repository, Stargazer, Tag } from '../../entities';
import {
  IActorsRepository,
  IMetadataRepository,
  IReleasesRepository,
  IRepositoriesRepository,
  IStargazersRepository,
  ITagsRepository,
} from '../../repos';
import { EntityConstructor, Iterable, Service, TIterableResourceResult } from '../Service';
import { ReleasesIterator } from './ReleasesIterator';
import { StargazersIterator } from './StargazersIterator';
import { TagsIterator } from './TagsIterator';

export type ServiceOpts = Required<{
  actors: IActorsRepository;
  repositories: IRepositoriesRepository;
  stargazers: IStargazersRepository;
  tags: ITagsRepository;
  releases: IReleasesRepository;
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

  resources(repositoryId: string, resources: { resource: EntityConstructor }[]): Iterable {
    const iterators: Iterable[] = resources.map((it) => {
      switch (it.resource) {
        case Stargazer:
          return new StargazersIterator(repositoryId, {
            repository: this.persistence.stargazers,
            limit: 1000,
            skip: 0,
          });
        case Tag:
          return new TagsIterator(repositoryId, {
            repository: this.persistence.tags,
            limit: 1000,
            skip: 0,
          });
        case Release:
          return new ReleasesIterator(repositoryId, {
            repository: this.persistence.releases,
            limit: 1000,
            skip: 0,
          });
        default:
          throw new Error('Unknown iterator');
      }
    });

    return new ResourcesIterator(iterators);
  }
}

class ResourcesIterator implements Iterable {
  constructor(private iterables: Iterable[]) {}

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<TIterableResourceResult, any>> {
    if (this.iterables.length === 0) return Promise.resolve({ done: true, value: undefined });

    const results = await Promise.all(this.iterables.map((pi) => pi.next()));

    const finalResult = results.reduce(
      (memo, result) =>
        result.done ? memo : memo.concat([{ items: result.value[0]?.items, endCursor: result.value[0]?.endCursor }]),
      [] as TIterableResourceResult,
    );

    this.iterables = this.iterables.filter((_, index) => !results[index].done);

    return Promise.resolve({ done: false, value: finalResult });
  }
}

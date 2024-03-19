import { Actor } from '@gittrends/entities';
import { Repository } from '@gittrends/entities';

import { EntityRepositories } from '../PersistenceService';
import { Iterable, RepositoryResource, RepositoryResourceName, Service } from '../Service';
import { ResourceIterator } from './ResourcesIterator';

export class LocalService implements Service {
  private readonly persistence: EntityRepositories;

  constructor(opts: EntityRepositories) {
    this.persistence = opts;
  }

  async get(id: string): Promise<Repository | undefined> {
    const repo = await this.persistence.get('repositories').findById(id);

    if (repo?.owner && typeof repo.owner === 'string') {
      repo.owner = (await this.persistence.get('actors').findById(repo.owner)) || repo.owner;
    }

    return repo;
  }

  async getActor(id: string): Promise<Actor | undefined>;
  async getActor(id: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    return this.persistence.get('actors').findById(id);
  }

  async find(name: string): Promise<Repository | undefined> {
    const repo = await this.persistence.get('repositories').findByName(name);

    if (repo?.owner && typeof repo.owner === 'string') {
      repo.owner = (await this.persistence.get('actors').findById(repo.owner)) || repo.owner;
    }

    return repo;
  }

  resources(repositoryId: string, resources: { resource: RepositoryResourceName }[]): Iterable<RepositoryResource> {
    const iterators: Iterable<RepositoryResource>[] = resources.map(
      (it) =>
        new ResourceIterator<RepositoryResource>(repositoryId, {
          repository: this.persistence.get(it.resource),
          limit: 1000,
          skip: 0,
        }),
    );

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

import { RepositoryResource } from '../../entities';
import { IResourceRepository } from '../../repos';
import { Iterable } from '../Service';

export class ResourceIterator<T extends RepositoryResource> implements Iterable {
  private repository: IResourceRepository<T>;

  private hasNext = true;
  private limit = 1000;
  private skip = 0;

  constructor(private repositoryId: string, opts: { repository: IResourceRepository<T>; limit: number; skip: number }) {
    this.repository = opts.repository;
    this.limit = opts.limit || 500;
    this.skip = opts.skip || 0;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<[{ items: T[]; endCursor?: string; hasNextPage: boolean }]> {
    return this;
  }

  async next(): Promise<IteratorResult<[{ items: T[]; endCursor?: string; hasNextPage: boolean }], any>> {
    if (!this.hasNext) return Promise.resolve({ done: true, value: undefined });

    const releases = await this.repository.findByRepository(this.repositoryId, {
      limit: this.limit,
      skip: this.skip,
    });

    this.skip += this.limit;
    this.hasNext = releases.length === this.limit;

    if (releases.length === 0) return Promise.resolve({ done: true, value: undefined });

    return Promise.resolve({
      done: false,
      value: [{ items: releases, endCursor: `${this.skip}`, hasNextPage: this.hasNext }],
    });
  }
}

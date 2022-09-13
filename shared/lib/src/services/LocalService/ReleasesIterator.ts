import { Release } from '../../entities';
import { IReleasesRepository } from '../../repos';
import { Iterable } from '../Service';

export class ReleasesIterator implements Iterable {
  private repository: IReleasesRepository;

  private hasNext: boolean = true;
  private limit: number = 1000;
  private skip: number = 0;

  constructor(private repositoryId: string, opts: { repository: IReleasesRepository; limit: number; skip: number }) {
    this.repository = opts.repository;
    this.limit = opts.limit || 500;
    this.skip = opts.skip || 0;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<[{ items: Release[]; endCursor?: string | undefined }]> {
    return this;
  }

  async next(): Promise<IteratorResult<[{ items: Release[]; endCursor?: string | undefined }], any>> {
    if (!this.hasNext) return Promise.resolve({ done: true, value: undefined });

    const releases = await this.repository.findByRepository(this.repositoryId, {
      limit: this.limit,
      skip: this.skip,
    });

    this.skip += this.limit;
    this.hasNext = releases.length === this.limit;

    if (releases.length === 0) return Promise.resolve({ done: true, value: undefined });

    return Promise.resolve({ done: false, value: [{ items: releases, endCursor: `${this.skip}` }] });
  }
}

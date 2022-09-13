import { Tag } from '../../entities';
import { ITagsRepository } from '../../repos';
import { Iterable } from '../Service';

export class TagsIterator implements Iterable {
  private repository: ITagsRepository;

  private hasNext: boolean = true;
  private limit: number = 1000;
  private skip: number = 0;

  constructor(private repositoryId: string, opts: { repository: ITagsRepository; limit: number; skip: number }) {
    this.repository = opts.repository;
    this.limit = opts.limit || 500;
    this.skip = opts.skip || 0;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<[{ items: Tag[]; endCursor?: string | undefined }]> {
    return this;
  }

  async next(): Promise<IteratorResult<[{ items: Tag[]; endCursor?: string | undefined }], any>> {
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

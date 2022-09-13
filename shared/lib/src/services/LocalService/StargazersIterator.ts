import { Stargazer } from '../../entities';
import { IStargazersRepository } from '../../repos';
import { Iterable } from '../Service';

export class StargazersIterator implements Iterable {
  private repository: IStargazersRepository;

  private hasNext: boolean = true;
  private limit: number = 1000;
  private skip: number = 0;

  constructor(private repositoryId: string, opts: { repository: IStargazersRepository; limit: number; skip: number }) {
    this.repository = opts.repository;
    this.limit = opts.limit || 500;
    this.skip = opts.skip || 0;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<[{ items: Stargazer[]; endCursor?: string | undefined }]> {
    return this;
  }

  async next(): Promise<IteratorResult<[{ items: Stargazer[]; endCursor?: string | undefined }], any>> {
    if (!this.hasNext) return Promise.resolve({ done: true, value: undefined });

    const stargazers = await this.repository.findByRepository(this.repositoryId, {
      limit: this.limit,
      skip: this.skip,
    });

    this.skip += this.limit;
    this.hasNext = stargazers.length === this.limit;

    if (stargazers.length === 0) return Promise.resolve({ done: true, value: undefined });

    return Promise.resolve({ done: false, value: [{ items: stargazers, endCursor: `${this.skip}` }] });
  }
}

import { Repository, Stargazer, User } from '../types';
import { Iterable, Service, ServiceOpts } from './Service';

export class LocalService implements Service {
  private readonly persistence;

  constructor(opts: ServiceOpts) {
    this.persistence = opts.persistence;
  }

  async find(name: string): Promise<Repository | null> {
    return (await this.persistence.repositories.findByName(name)) || null;
  }

  stargazers(repositoryId: string): Iterable<Stargazer[]> {
    const self = this;
    let hasNext: boolean = true;

    const limit = 1000;
    let skip: number = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      async next() {
        if (!hasNext) return { done: true };

        const stargazers = await self.persistence.stargazers.findByRepository(repositoryId, { limit, skip });

        skip += limit;
        hasNext = stargazers.length === limit;

        if (stargazers.length === 0) return { done: true };

        return {
          done: false,
          value: stargazers,
          endCursor: skip,
        };
      },
    };
  }
}

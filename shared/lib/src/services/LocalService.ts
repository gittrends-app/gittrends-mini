import { Repository, Stargazer } from '../entities';
import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IStargazersRepository } from '../repos';
import { Iterable, Service } from './Service';

export type ServiceOpts = Required<{
  actors: IActorsRepository;
  repositories: IRepositoriesRepository;
  stargazers: IStargazersRepository;
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

  stargazers(repositoryId: string, opts?: { endCursor?: string }): Iterable<Stargazer[]> {
    const self = this;
    let hasNext: boolean = true;

    const limit = 1000;
    let skip: number = parseInt(opts?.endCursor || '0');

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

        return { done: false, value: stargazers, endCursor: skip };
      },
    };
  }
}

import Repository from '../entities/Repository';
import Stargazer from '../entities/Stargazer';
import IActorsRepo from '../repos/actors/actors.repo';
import IMetadataRepo from '../repos/metadata/metadata.repo';
import IRepositoriesRepo from '../repos/repositories/repositories.repo';
import IStargazersRepo from '../repos/stargazers/stargazers.repo';

export interface Iterable<T> {
  [Symbol.iterator](): Iterable<T>;
  next(): Promise<{ done: boolean; value?: T; endCursor?: string | number }>;
}

export type ServiceOpts = {
  persistence: {
    actors: IActorsRepo;
    repositories: IRepositoriesRepo;
    stargazers: IStargazersRepo;
    metadata: IMetadataRepo;
  };
};

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  stargazers(repositoryId: string, opts?: { endCursor?: string }): Iterable<Stargazer[] | undefined>;
}

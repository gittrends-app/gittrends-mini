import IActorsRepo from '../repos/actors/actorsRepo';
import IMetadataRepo from '../repos/metadata/metadataRepo';
import IRepositoriesRepo from '../repos/repositories/repositoriesRepo';
import IStargazersRepo from '../repos/stargazers/stargazersRepo';
import { Repository, Stargazer } from '../types';

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
  find(name: string): Promise<Repository | null>;
  stargazers(id: string): Iterable<Stargazer[]>;
}

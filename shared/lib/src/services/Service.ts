import { Release, Repository, Stargazer, Tag } from '../entities';

export type TIterableResourceResult = { items: Stargazer[] | Release[] | Tag[]; endCursor?: string }[];

export type EntityConstructor = new (...args: any) => Stargazer | Release | Tag;
export type Iterable = AsyncIterableIterator<TIterableResourceResult>;

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  resources(repositoryId: string, resources: { resource: EntityConstructor; endCursor?: string }[]): Iterable;
}

import { Entity, Repository, RepositoryResource } from '../entities';
import { SearchComponentQuery } from '../github/components';
import { Constructor } from '../types';

export type Iterable<T extends Entity = RepositoryResource> = AsyncIterableIterator<
  { items: T[]; endCursor?: string }[]
>;

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;
  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string }[],
  ): Iterable;
}

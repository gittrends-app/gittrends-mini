import { Entity, Repository } from '../entities';
import { RepositoryResource } from '../entities/interfaces/RepositoryResource';
import { SearchComponentQuery } from '../github/components';
import { Constructor } from '../types';

export type Iterable<T extends Entity | RepositoryResource> = AsyncIterableIterator<
  { items: T[]; endCursor?: string; hasNextPage?: boolean }[]
>;

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;
  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string; hasNextPage?: boolean }[],
  ): Iterable<RepositoryResource>;
}

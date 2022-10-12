import { SearchComponentQuery } from '@gittrends/github';

import { Actor, Entity, Repository, RepositoryResource } from '@gittrends/entities';

export type Iterable<T extends Entity | RepositoryResource> = AsyncIterableIterator<
  { items: T[]; endCursor?: string; hasNextPage?: boolean }[]
>;

export interface Service {
  get(id: string): Promise<Repository | undefined>;
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;
  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string; hasNextPage?: boolean }[],
  ): Iterable<RepositoryResource>;
  getActor(id: string): Promise<Actor | undefined>;
}

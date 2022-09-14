import { Repository, RepositoryResource } from '../entities';
import { Constructor } from '../types';

export type Iterable = AsyncIterableIterator<{ items: RepositoryResource[]; endCursor?: string }[]>;

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string }[],
  ): Iterable;
}

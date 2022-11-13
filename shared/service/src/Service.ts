import { SearchComponentQuery } from '@gittrends/github';

import {
  Actor,
  Dependency,
  Entity,
  Issue,
  PullRequest,
  Release,
  Repository,
  RepositoryResource,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/entities';

export type Iterable<T extends Entity | RepositoryResource> = AsyncIterableIterator<
  { items: T[]; endCursor?: string; hasNextPage?: boolean }[]
>;

export type IterableRepositoryResources = Dependency | Issue | PullRequest | Release | Stargazer | Tag | Watcher;

export interface Service {
  get(id: string): Promise<Repository | undefined>;
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;

  resources(
    repositoryId: string,
    resources: {
      resource: EntityConstructor<IterableRepositoryResources>;
      endCursor?: string;
      hasNextPage?: boolean;
    }[],
  ): Iterable<RepositoryResource>;

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
}

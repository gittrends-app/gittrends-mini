import { SearchComponentQuery } from '@gittrends/github';

import type { Actor, Dependency, IssueOrPull, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/entities';

export type Iterable<T> = AsyncIterableIterator<{ items: T[]; endCursor?: string; hasNextPage?: boolean }[]>;

export type RepositoryResource = Dependency | IssueOrPull | Release | Stargazer | Tag | Watcher;

export type RepositoryResourceName =
  | 'dependencies'
  | 'issues'
  | 'pull_requests'
  | 'releases'
  | 'stargazers'
  | 'tags'
  | 'watchers';

export interface Service {
  get(id: string): Promise<Repository | undefined>;
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;

  resources(
    repositoryId: string,
    resources: { resource: RepositoryResourceName; endCursor?: string; hasNextPage?: boolean }[],
  ): Iterable<RepositoryResource>;

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
}

import { SearchComponentQuery } from '@gittrends/github';

import {
  Actor,
  Dependency,
  Entity,
  Issue,
  IssueOrPull,
  PullRequest,
  Release,
  Repository,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/entities';

export type Iterable<T extends Entity> = AsyncIterableIterator<
  { items: T[]; endCursor?: string; hasNextPage?: boolean }[]
>;

export type IterableResources = Dependency | IssueOrPull | Issue | PullRequest | Release | Stargazer | Tag | Watcher;

export interface Service {
  get(id: string): Promise<Repository | undefined>;
  find(name: string): Promise<Repository | undefined>;
  search?(opts: SearchComponentQuery): Iterable<Repository>;

  resources(
    repositoryId: string,
    resources: {
      resource: EntityPrototype<IterableResources>;
      endCursor?: string;
      hasNextPage?: boolean;
    }[],
  ): Iterable<IterableResources>;

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
}

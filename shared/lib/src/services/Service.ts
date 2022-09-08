import { Repository, Stargazer } from '../entities';

export interface Iterable<T> {
  [Symbol.iterator](): Iterable<T>;
  next(): Promise<{ done: boolean; value?: T; endCursor?: string | number }>;
}

export interface Service {
  find(name: string): Promise<Repository | undefined>;
  stargazers(repositoryId: string, opts?: { endCursor?: string }): Iterable<Stargazer[] | undefined>;
}

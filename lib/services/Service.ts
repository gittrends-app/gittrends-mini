import { Repository, Stargazer } from '../../types';

export interface Iterable<T> {
  [Symbol.iterator](): Iterable<T>;
  hasNext(): boolean;
  next(): Promise<{ done: boolean; value?: T }>;
  endCursor?: string;
}

export interface Service {
  find(name: string): Promise<Repository | null>;
  stargazers(id: string): Iterable<Stargazer[]>;
}

import { Repositorio } from '../../types';

export interface Iterable {
  [Symbol.iterator](): Iterable;
  hasNext(): boolean;
  next(): Promise<{ done: boolean; value?: any }>;
  endCursor: string | undefined;
}

export interface Service {
  find(name: string): Promise<Repositorio | null>;
  stargazers(id: string): Iterable;
}

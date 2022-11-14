import { Entity } from '@gittrends/entities';

export interface Cache<K = Record<string, any>> {
  add(entity: Entity & K): Promise<void>;
  delete(entity: Entity & K): Promise<void>;
  get<T extends Entity>(props: K): Promise<T | undefined>;
}

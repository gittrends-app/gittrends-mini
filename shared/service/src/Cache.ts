import { Entity } from '@gittrends/entities';

export interface Cache<K = Record<string, unknown>> {
  add(entity: Entity & K): Promise<void>;
  delete(entity: Entity & K): Promise<void>;
  get<T extends Entity>(EntityRef: EntityPrototype<T>, key: K): Promise<T | undefined>;
}

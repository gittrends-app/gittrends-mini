import { Entity } from '@gittrends/entities';

export interface Cache<K = Record<string, unknown>> {
  add(entity: Entity & K): Promise<void>;
  delete(entity: Entity & K): Promise<void>;
  get(props: K): Promise<Record<string, unknown> | undefined>;
}

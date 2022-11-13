import { Entity } from '@gittrends/entities';

export interface Cache {
  add(entity: Entity): Promise<boolean>;
  delete(entity: Entity): Promise<boolean>;
  get<T extends Entity>(Ref: Prototype<T>, props: any): Promise<T | undefined>;
}

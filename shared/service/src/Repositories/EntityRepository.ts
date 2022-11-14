import { Entity } from '@gittrends/entities';

export interface IEntityRepository<T extends Entity> {
  insert(entity: T | T[]): Promise<void>;
  upsert(entity: T | T[]): Promise<void>;
}

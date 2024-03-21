export interface IEntityRepository<T> {
  insert(entity: T | T[]): Promise<void>;
  upsert(entity: T | T[]): Promise<void>;
}

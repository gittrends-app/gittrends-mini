import { IEntityRepository } from './EntityRepository';

export interface INodeRepository<T extends { id: string }> extends IEntityRepository<T> {
  findById(id: string): Promise<T | undefined>;
  findById(id: string | string[]): Promise<(T | undefined)[]>;
}

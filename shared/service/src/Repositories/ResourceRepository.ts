import { RepositoryResource } from '../Service';
import { IEntityRepository } from './EntityRepository';

export interface IResourceRepository<T extends RepositoryResource> extends IEntityRepository<T> {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]>;
  countByRepository(repository: string): Promise<number>;
}

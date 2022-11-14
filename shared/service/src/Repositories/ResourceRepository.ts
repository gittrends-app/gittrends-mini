import { Entity, RepositoryResource } from '@gittrends/entities';

import { IEntityRepository } from './EntityRepository';

export interface IResourceRepository<T extends Entity & RepositoryResource> extends IEntityRepository<T> {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]>;
  countByRepository(repository: string): Promise<number>;
}

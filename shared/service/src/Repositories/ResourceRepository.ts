import { RepositoryResource } from '@gittrends/entities';

export interface IResourceRepository<T extends RepositoryResource> {
  countByRepository(repository: string): Promise<number>;
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]>;
  save(stargazer: T | T[]): Promise<void>;
}

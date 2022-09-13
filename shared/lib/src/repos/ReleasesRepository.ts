import { Release } from '../entities/Release';

export interface IReleasesRepository {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Release[]>;
  save(tags: Release | Release[]): Promise<void>;
}

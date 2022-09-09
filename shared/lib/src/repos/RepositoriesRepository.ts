import { Repository } from '../entities/Repository';

export interface IRepositoriesRepository {
  findById(id: string, opts?: { resolve?: ['owner'] }): Promise<Repository | undefined>;
  findByName(name: string, opts?: { resolve?: ['owner'] }): Promise<Repository | undefined>;
  save(repo: Repository | Repository[]): Promise<void>;
}

import { Repository } from '../entities/Repository';

export interface IRepositoriesRepository {
  findById(id: string): Promise<Repository | undefined>;
  findByName(name: string): Promise<Repository | undefined>;
  save(repo: Repository | Repository[]): Promise<void>;
}

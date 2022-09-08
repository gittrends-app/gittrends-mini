import { Repository } from '../entities/Repository';
import { Stargazer } from '../entities/Stargazer';

export interface IStargazersRepository {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Stargazer[]>;
  save(stargazer: Stargazer | Stargazer[], opts: { repository: Repository | string; endCursor: string }): Promise<void>;
}

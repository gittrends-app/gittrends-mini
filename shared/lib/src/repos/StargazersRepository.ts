import { Stargazer } from '../entities/Stargazer';

export interface IStargazersRepository {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Stargazer[]>;
  save(stargazer: Stargazer | Stargazer[]): Promise<void>;
}

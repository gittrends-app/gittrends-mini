import { Actor } from '../entities/Actor';

export interface IActorsRepository {
  findById(id: string): Promise<Actor | undefined>;
  findByLogin(login: string): Promise<Actor | undefined>;
  save(user: Actor | Actor[]): Promise<void>;
}

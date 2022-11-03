import { Actor } from '@gittrends/entities';

export interface IActorsRepository {
  findById(id: string): Promise<Actor | undefined>;
  findById(id: string[]): Promise<(Actor | undefined)[]>;
  findByLogin(login: string): Promise<Actor | undefined>;
  save(user: Actor | Actor[], opts?: { onConflict: 'merge' | 'ignore' }): Promise<void>;
  replace(user: Actor | Actor[]): Promise<void>;
}

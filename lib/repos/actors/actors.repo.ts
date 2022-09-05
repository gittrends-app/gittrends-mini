import Actor from '../../entities/Actor';

export default interface IActorsRepo {
  findById(id: string): Promise<Actor | undefined>;
  findByLogin(login: string): Promise<Actor | undefined>;
  save(user: Actor | Actor[]): Promise<void>;
}

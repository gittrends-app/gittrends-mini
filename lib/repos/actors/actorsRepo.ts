import { User } from '../../types';

export default interface IActorsRepo {
  findById(id: string): Promise<User | undefined>;
  findByLogin(login: string): Promise<User | undefined>;
  save(user: User | User[]): Promise<void>;
}

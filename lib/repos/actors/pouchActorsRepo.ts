import { each } from 'bluebird';
import { omit } from 'lodash';

import { User } from '../../types';
import PouchDB from '../pouch.config';
import IActorsRepo from './actorsRepo';

type UserCollection = Omit<User, 'id'> & { _id: string };

export default class ActorsRepository implements IActorsRepo {
  private static collection = new PouchDB<UserCollection>('actors', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['login'] } });
  }

  private async find(criteria: Record<string, unknown>): Promise<User | undefined> {
    const { docs } = await ActorsRepository.collection.find({
      selector: criteria,
      limit: 1,
    });

    const user = docs.at(0);
    if (!user) return;

    return omit(
      { ...user, id: user._id, created_at: new Date(user.created_at), updated_at: new Date(user.updated_at) },
      ['_id', '_rev']
    );
  }

  async findById(id: string): Promise<User | undefined> {
    return this.find({ _id: id });
  }

  async findByLogin(login: string): Promise<User | undefined> {
    return this.find({ login: { $regex: new RegExp(login, 'i') } });
  }

  async save(user: User | User[]): Promise<void> {
    const users = Array.isArray(user) ? user : [user];

    await each(users, (user) =>
      ActorsRepository.collection.upsert(user.id, (doc): any => ({
        ...doc,
        ...omit(user, ['id']),
      }))
    );
  }
}

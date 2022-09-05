import { each } from 'bluebird';
import { omit } from 'lodash';

import Actor from '../../entities/Actor';
import PouchDB from '../pouch.config';
import IActorsRepo from './actorsRepo';

type ActorCollection = Omit<Actor, 'id' | 'toJSON'> & { _id: string };

export default class ActorsRepository implements IActorsRepo {
  private static collection = new PouchDB<ActorCollection>('actors', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['login'] } });
  }

  private async find(criteria: Record<string, unknown>): Promise<Actor | undefined> {
    const { docs } = await ActorsRepository.collection.find({
      selector: criteria,
      limit: 1,
    });

    const user = docs.at(0);
    if (!user) return;

    return Actor.from({ ...user, id: user._id });
  }

  async findById(id: string): Promise<Actor | undefined> {
    return this.find({ _id: id });
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    return this.find({ login: { $regex: new RegExp(login, 'i') } });
  }

  async save(user: Actor | Actor[]): Promise<void> {
    const users = Array.isArray(user) ? user : [user];

    await each(users, (user) =>
      ActorsRepository.collection.upsert(user.id, (doc): any => ({
        ...doc,
        ...omit(user.toJSON(), ['id']),
      }))
    );
  }
}

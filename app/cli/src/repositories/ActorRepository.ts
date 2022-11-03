import { Knex } from 'knex';

import { IActorsRepository } from '@gittrends/service';

import { Actor } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';

export class ActorsRepository implements IActorsRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<Actor | undefined>;
  async findById(id: string[]): Promise<(Actor | undefined)[]>;
  async findById(id: any): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    const actors = await this.db
      .table(Actor.__collection_name)
      .select('*')
      .whereIn('id', ids)
      .then((actors) =>
        ids.map((id) => {
          const actor = actors.find((actor) => actor.id === id);
          return actor ? Actor.from(actor) : undefined;
        }),
      );

    return Array.isArray(id) ? ids.map((id) => actors.find((actor) => actor?.id === id)) : actors.at(0);
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('login', login).first();
    return actor && actor.__updated_at ? Actor.from(actor) : undefined;
  }

  async save<T extends Actor>(user: T | T[], trx?: Knex.Transaction, upsert = false): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = Array.isArray(user) ? user : [user];

    await asyncIterator(actors, (actor) =>
      this.db
        .table(Actor.__collection_name)
        .insertEntity(Object.assign(actor, { __updated_at: new Date() }))
        .onConflict('id')
        ?.[upsert ? 'merge' : 'ignore']()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  async upsert<T extends Actor>(user: T | T[], trx?: Knex.Transaction): Promise<void> {
    return this.save(user, trx, true);
  }
}

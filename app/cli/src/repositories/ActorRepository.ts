import { each } from 'bluebird';
import { Knex } from 'knex';
import { uniqBy } from 'lodash';

import { IActorsRepository } from '@gittrends/service';

import { Actor } from '@gittrends/entities';

export class ActorsRepository implements IActorsRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('id', id).first();
    return actor && actor.__updated_at ? Actor.from(actor) : undefined;
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('login', login).first();
    return actor && actor.__updated_at ? Actor.from(actor) : undefined;
  }

  async save<T extends Actor>(user: T | T[], trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = uniqBy(Array.isArray(user) ? user : [user], 'id');

    await each(actors, (actor) =>
      this.db
        .table(Actor.__collection_name)
        .insertEntity(actor.toJSON())
        .onConflict('id')
        .ignore()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  async upsert<T extends Actor>(user: T | T[], trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = uniqBy(Array.isArray(user) ? user : [user], 'id');

    await each(actors, (actor) =>
      this.db
        .table(Actor.__collection_name)
        .insertEntity({ ...actor.toJSON(), __updated_at: new Date() })
        .onConflict('id')
        .merge()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

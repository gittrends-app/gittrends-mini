import { each } from 'bluebird';
import { Knex } from 'knex';
import { uniqBy } from 'lodash';

import { Actor, IActorsRepository } from '@gittrends/lib';

export class ActorsRepository implements IActorsRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('id', id).first();
    return actor ? Actor.from({ ...actor, status: actor.status && JSON.parse(actor.status) }) : undefined;
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('login', login).first();
    return actor ? Actor.from({ ...actor, status: actor.status && JSON.parse(actor.status) }) : undefined;
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
}

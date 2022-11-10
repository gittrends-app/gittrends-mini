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

    const actors = await asyncIterator(ids, async (id) =>
      this.db
        .table(Actor.__collection_name)
        .first('*')
        .where('id', id)
        .then((actor) => (actor ? Actor.from(actor) : undefined)),
    );

    return Array.isArray(id) ? actors : actors.at(0);
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('login', login).first();
    return actor && actor.__updated_at ? Actor.from(actor) : undefined;
  }

  async save(user: Actor | Actor[], opts?: { onConflict: 'merge' | 'ignore' }, trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = Array.isArray(user) ? user : [user];

    await asyncIterator(actors, (actor) =>
      this.db
        .table(Actor.__collection_name)
        .insertEntity(actor)
        .onConflict('id')
        ?.[opts?.onConflict || 'ignore']()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  async replace(user: Actor | Actor[], trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = Array.isArray(user) ? user : [user];

    await this.db
      .table(Actor.__collection_name)
      .delete()
      .whereIn(
        'id',
        actors.map((a) => a.id),
      )
      .transacting(transaction);

    await this.save(actors, { onConflict: 'ignore' }, transaction)
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

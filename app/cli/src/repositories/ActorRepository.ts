import { Knex } from 'knex';

import { IActorsRepository } from '@gittrends/service';

import { Actor, Entity } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';

function transform(data: Record<string, any>): Actor {
  const { type, ...rest } = data;
  return Entity.actor({ __type: type, ...rest });
}

export class ActorsRepository implements IActorsRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<Actor | undefined>;
  async findById(id: string[]): Promise<(Actor | undefined)[]>;
  async findById(id: any): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    const actors = await asyncIterator(ids, async (id) =>
      this.db
        .table('actors')
        .first('*')
        .where('id', id)
        .then((actor) => (actor ? transform(actor) : undefined)),
    );

    return Array.isArray(id) ? actors : actors.at(0);
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table('actors').select('*').where('login', login).first();
    return actor && actor.__updated_at ? transform(actor) : undefined;
  }

  private async _insert(
    user: Actor | Actor[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const actors = Array.isArray(user) ? user : [user];

    await asyncIterator(actors, ({ __type, ...rest }) =>
      this.db
        .table('actors')
        .insertEntity({ type: __type, ...rest })
        .onConflict('id')
        ?.[onConflict]()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  async insert(user: Actor | Actor[], trx?: Knex.Transaction): Promise<void> {
    return this._insert(user, trx, 'ignore');
  }

  async upsert(user: Actor | Actor[], trx?: Knex.Transaction): Promise<void> {
    return this._insert(user, trx, 'merge');
  }
}

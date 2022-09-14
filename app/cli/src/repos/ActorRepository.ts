import { map } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IActorsRepository } from '@gittrends/lib';

import { parse, transform } from '../helpers/sqlite';

export class ActorsRepository implements IActorsRepository {
  constructor(private db: Knex) {}

  async findById(id: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('id', id).first();
    return actor ? Actor.from(parse({ ...actor, status: actor.status && JSON.parse(actor.status) })) : undefined;
  }

  async findByLogin(login: string): Promise<Actor | undefined> {
    const actor = await this.db.table(Actor.__collection_name).select('*').where('login', login).first();
    return actor ? Actor.from(parse({ ...actor, status: actor.status && JSON.parse(actor.status) })) : undefined;
  }

  async save<T extends Actor>(user: T | T[], trx?: Knex.Transaction): Promise<void> {
    await map(Array.isArray(user) ? user : [user], (actor: any) => {
      const command = this.db
        .table(Actor.__collection_name)
        .insert({
          ...transform(actor),
          status: actor.status && JSON.stringify(actor.status),
        })
        .onConflict('id')
        .merge();
      return trx ? command.transacting(trx) : command;
    });
  }
}

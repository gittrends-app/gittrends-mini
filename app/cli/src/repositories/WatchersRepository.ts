import { Knex } from 'knex';
import { cloneDeep, omit } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Entity, Watcher } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class WatchersRepository implements IResourceRepository<Watcher> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table('watchers')
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Watcher[]> {
    const watcher = await this.db
      .table('watchers')
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return watcher.map((watcher) => Entity.watcher({ __type: 'Watcher', ...watcher }));
  }

  private async save(
    watcher: Watcher | Watcher[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const watchers = cloneDeep(Array.isArray(watcher) ? watcher : [watcher]);
    const actors = extractActors(watchers);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      asyncIterator(watchers, (watcher) =>
        this.db
          .table('watchers')
          .insertEntity(omit(watcher, ['__type']))
          .onConflict(['repository', 'user'])
          ?.[onConflict]()
          .transacting(transaction),
      ),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Watcher | Watcher[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Watcher | Watcher[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

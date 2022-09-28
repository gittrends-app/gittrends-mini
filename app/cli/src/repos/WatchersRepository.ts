import { each } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Watcher } from '@gittrends/lib';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class WatchersRepository implements IResourceRepository<Watcher> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Watcher.__collection_name)
      .where('repository', repository)
      .count('user', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Watcher[]> {
    const watcher = await this.db
      .table(Watcher.__collection_name)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return watcher.map((star) => new Watcher(star));
  }

  async save(watcher: Watcher | Watcher[], trx?: Knex.Transaction): Promise<void> {
    const watchers = Array.isArray(watcher) ? watcher : [watcher];
    const actors = extractEntityInstances<Actor>(watchers, Actor as any);

    const transaction = trx || (await this.db.transaction());
    try {
      await this.actorsRepo.save(actors, transaction);
      await each(watchers, (watcher) =>
        this.db
          .table(Watcher.__collection_name)
          .insert(watcher.toJSON('sqlite'))
          .onConflict(['repository', 'user'])
          .ignore()
          .transacting(transaction),
      );
      if (!trx) await transaction.commit();
    } catch (error) {
      if (!trx) await transaction.rollback(error);
      throw error;
    }
  }
}

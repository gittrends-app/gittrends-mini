import { all, each } from 'bluebird';
import { Knex } from 'knex';

import { IResourceRepository, Repository, User, Watcher } from '@gittrends/lib';

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
    const watchers = (Array.isArray(watcher) ? watcher : [watcher]).map((w) => w.toJSON('sqlite'));

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(
        watchers.reduce(
          (memo, user) => (user.user instanceof User ? memo.concat([user.user]) : memo),
          new Array<User>(),
        ),
        transaction,
      ),
      each(watchers, (star) =>
        this.db
          .table(Watcher.__collection_name)
          .insert({
            repository: star.repository instanceof Repository ? star.repository.id : star.repository,
            user: star.user instanceof User ? star.user.id : star.user,
          })
          .onConflict(['repository', 'user'])
          .ignore()
          .transacting(transaction),
      ),
    ]);

    if (!trx) await transaction.commit();
  }
}
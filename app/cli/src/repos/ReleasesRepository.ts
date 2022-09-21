import { all, each } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Release } from '@gittrends/lib';

import { ActorsRepository } from './ActorRepository';

export class ReleasesRepository implements IResourceRepository<Release> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Release.__collection_name)
      .where('repository', repository)
      .count('id', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Release[]> {
    const releases = await this.db
      .table(Release.__collection_name)
      .select('*')
      .where('repository', repository)
      .orderBy('created_at', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return releases.map((release) => new Release(release));
  }

  async save(release: Release | Release[], trx?: Knex.Transaction): Promise<void> {
    const releases = Array.isArray(release) ? release : [release];

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(
        releases.reduce(
          (memo, rel) => (rel.author instanceof Actor ? memo.concat([rel.author]) : memo),
          new Array<Actor>(),
        ),
        transaction,
      ),
      each(releases, (rel) =>
        this.db
          .table(Release.__collection_name)
          .insert({ ...rel, author: rel.author instanceof Actor ? rel.author.id : rel.author })
          .onConflict(['id'])
          .ignore()
          .transacting(transaction),
      ),
    ]);

    if (!trx) await transaction.commit();
  }
}

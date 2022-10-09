import { all, each } from 'bluebird';
import { Knex } from 'knex';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Reaction, Release } from '@gittrends/entities';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';
import { ReactionsRepository } from './ReactionsRepository';

export class ReleasesRepository implements IResourceRepository<Release> {
  private actorsRepo: ActorsRepository;
  private reactionsRepo: ReactionsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
    this.reactionsRepo = new ReactionsRepository(db);
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

    const actors = extractEntityInstances<Actor>(releases, Actor as any);
    const reactions = extractEntityInstances<Reaction>(releases, Reaction);

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(actors, transaction),
      this.reactionsRepo.save(reactions, transaction),
      each(
        releases.map((rel) => {
          if (Array.isArray(rel.reactions)) rel.reactions = rel.reactions.length;
          return rel;
        }),
        (rel) =>
          this.db
            .table(Release.__collection_name)
            .insertEntity(rel.toJSON())
            .onConflict(['id'])
            .ignore()
            .transacting(transaction),
      ),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

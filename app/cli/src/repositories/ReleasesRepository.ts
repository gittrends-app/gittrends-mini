import { Knex } from 'knex';
import { cloneDeep, omit } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Entity, Release } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors, extractReactions } from '../helpers/extract';
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
      .table('releases')
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Release[]> {
    const releases = await this.db
      .table('releases')
      .select('*')
      .where('repository', repository)
      .orderBy('created_at', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return releases.map((release) => Entity.release({ __type: 'Release', ...release }));
  }

  private async save(
    release: Release | Release[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const releases = cloneDeep(Array.isArray(release) ? release : [release]);

    const actors = extractActors(releases);
    const reactions = extractReactions(releases);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      this.reactionsRepo.insert(reactions, transaction),
      asyncIterator(
        releases.map((rel) => {
          if (Array.isArray(rel.reactions)) rel.reactions = rel.reactions.length;
          return rel;
        }),
        (release) =>
          this.db
            .table('releases')
            .insertEntity(omit(release, ['__type']))
            .onConflict(['id'])
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

  insert(entity: Release | Release[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Release | Release[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

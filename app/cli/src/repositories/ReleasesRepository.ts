import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Reaction, Release } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
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
      .count('repository', { as: 'count' });
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

  private async save(
    release: Release | Release[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const releases = cloneDeep(Array.isArray(release) ? release : [release]);

    const actors = extractEntityInstances<Actor>(releases, Actor as any);
    const reactions = extractEntityInstances<Reaction>(releases, Reaction);

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
            .table(Release.__collection_name)
            .insertEntity(release)
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

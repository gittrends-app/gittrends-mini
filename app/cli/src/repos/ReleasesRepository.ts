import { each } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Reaction, Release } from '@gittrends/lib';

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

    try {
      await this.reactionsRepo.save(reactions, transaction);
      await this.actorsRepo.save(actors, transaction);
      await each(
        releases.map((rel) => {
          if (Array.isArray(rel.reactions)) rel.reactions = rel.reactions.length;
          return rel;
        }),
        (rel) =>
          this.db
            .table(Release.__collection_name)
            .insert(rel.toJSON('sqlite'))
            .onConflict(['id'])
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

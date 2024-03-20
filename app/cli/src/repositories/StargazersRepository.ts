import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Entity, Stargazer } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class StargazersRepository implements IResourceRepository<Stargazer> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table('stargazers')
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Stargazer[]> {
    const stars = await this.db
      .table('stargazers')
      .select('*')
      .where('repository', repository)
      .orderBy('starred_at', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return stars.map((star) => Entity.stargazer(star));
  }

  private async save(
    stargazer: Stargazer | Stargazer[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const stars = cloneDeep(Array.isArray(stargazer) ? stargazer : [stargazer]);
    const actors = extractActors(stars);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      asyncIterator(stars, (star) =>
        this.db
          .table('stargazers')
          .insertEntity(star)
          .onConflict(['repository', 'user', 'starred_at'])
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

  insert(entity: Stargazer | Stargazer[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Stargazer | Stargazer[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

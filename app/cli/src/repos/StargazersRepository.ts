import { all, map } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Stargazer } from '@gittrends/lib';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class StargazersRepository implements IResourceRepository<Stargazer> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Stargazer.__collection_name)
      .where('repository', repository)
      .count('user', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Stargazer[]> {
    const stars = await this.db
      .table(Stargazer.__collection_name)
      .select('*')
      .where('repository', repository)
      .orderBy('starred_at', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return stars.map((star) => new Stargazer(star));
  }

  async save(stargazer: Stargazer | Stargazer[], trx?: Knex.Transaction): Promise<void> {
    const stars = Array.isArray(stargazer) ? stargazer : [stargazer];
    const actors = extractEntityInstances<Actor>(stars, Actor as any);

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(actors, transaction),
      map(stars, (star) =>
        this.db
          .table(Stargazer.__collection_name)
          .insertEntity(star.toJSON())
          .onConflict(['repository', 'user', 'starred_at'])
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

import { map } from 'bluebird';
import { Knex } from 'knex';

import { IResourceRepository, Repository, Stargazer, User } from '@gittrends/lib';

import { parse } from '../helpers/sqlite';
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
    return count;
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Stargazer[]> {
    const stars = await this.db
      .table(Stargazer.__collection_name)
      .select('*')
      .where('repository', repository)
      .orderBy('starred_at', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return stars.map((star) => new Stargazer(parse(star)));
  }

  async save(stargazer: Stargazer | Stargazer[], trx?: Knex.Transaction): Promise<void> {
    const stars = Array.isArray(stargazer) ? stargazer : [stargazer];

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.save(
        stars.reduce((memo, user) => (user.user instanceof User ? memo.concat([user.user]) : memo), new Array<User>()),
        transaction,
      ),
      map(stars, (star) =>
        this.db
          .table(Stargazer.__collection_name)
          .insert({
            repository: star.repository instanceof Repository ? star.repository.id : star.repository,
            user: star.user instanceof User ? star.user.id : star.user,
            starred_at: star.starred_at,
          })
          .onConflict(['repository', 'user', 'starred_at'])
          .ignore()
          .transacting(transaction),
      ),
    ]);

    if (!trx) await transaction.commit();
  }
}

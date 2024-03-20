import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IRepositoriesRepository } from '@gittrends/service';

import { Entity, Repository } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { ActorsRepository } from './ActorRepository';
import { extractActors } from 'src/helpers/extract';

export class RepositoriesRepository implements IRepositoriesRepository {
  private readonly actorRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorRepo = new ActorsRepository(db);
  }

  async findById(id: string): Promise<Repository | undefined>;
  async findById(id: string[]): Promise<(Repository | undefined)[]>;
  async findById(id: any): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    const results = await asyncIterator(ids, (id) =>
      this.db
        .first('*')
        .from('repositories')
        .where('id', id)
        .then((result) => result && Entity.repository(result)),
    );

    return Array.isArray(id) ? results : results[0];
  }

  async findByName(name: string): Promise<Repository | undefined> {
    return this.db
      .first('*')
      .from('repositories')
      .whereRaw('UPPER(name_with_owner) LIKE ?', name.toUpperCase())
      .then((result) => result && Entity.repository(result));
  }

  private async save(
    repo: Repository | Repository[],
    trx?: Knex.Transaction,
    onConflict: 'merge' | 'ignore' = 'ignore',
  ): Promise<void> {
    const repos = cloneDeep(Array.isArray(repo) ? repo : [repo]);
    const actors = extractActors(repos);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorRepo.insert(actors, transaction),
      asyncIterator(repos, (repo) =>
        this.db
          .table('repositories')
          .insertEntity(repo)
          .onConflict('id')
          ?.[onConflict || 'merge']()
          .transacting(transaction),
      ),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Repository | Repository[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }
  upsert(entity: Repository | Repository[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

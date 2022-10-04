import { all, map } from 'bluebird';
import { Knex } from 'knex';
import { uniqBy } from 'lodash';

import { Actor, IRepositoriesRepository, Repository } from '@gittrends/lib';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';
import { MetadataRepository } from './MetadataRepository';

export class RepositoriesRepository implements IRepositoriesRepository {
  private readonly actorRepo: ActorsRepository;
  private readonly metaRepo: MetadataRepository;

  constructor(private db: Knex) {
    this.actorRepo = new ActorsRepository(db);
    this.metaRepo = new MetadataRepository(db);
  }

  private async find(query: Knex.QueryBuilder, resolve = false): Promise<Repository | undefined> {
    const repo = await query.table(Repository.__collection_name).select('*');

    if (repo) {
      const parsedRepo = new Repository(repo);

      if (resolve) {
        const owner = await this.actorRepo.findById(parsedRepo.owner as string);
        parsedRepo.owner = owner || parsedRepo.owner;
      }

      return parsedRepo;
    }
  }

  async findById(id: string, opts?: { resolve?: ['owner'] }): Promise<Repository | undefined> {
    return this.find(this.db.where('id', id).first(), opts?.resolve !== undefined);
  }

  async findByName(name: string, opts?: { resolve?: ['owner'] }): Promise<Repository | undefined> {
    return this.find(
      this.db.whereRaw('UPPER(name_with_owner) LIKE ?', name.toUpperCase()).first(),
      opts?.resolve !== undefined,
    );
  }

  async save(repo: Repository | Repository[], trx?: Knex.Transaction): Promise<void> {
    const repos = uniqBy(Array.isArray(repo) ? repo : [repo], 'id');
    const actors = extractEntityInstances<Actor>(repos, Actor as any);

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorRepo.save(actors, transaction),
      map(repos, (repo) =>
        this.db
          .table(Repository.__collection_name)
          .insertEntity(repo.toJSON())
          .onConflict('id')
          .merge()
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

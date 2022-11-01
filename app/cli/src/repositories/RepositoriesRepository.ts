import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IRepositoriesRepository } from '@gittrends/service';

import { Actor, Repository } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
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
    return this.find(this.db.whereRaw('UPPER(name_with_owner) LIKE ?', name.toUpperCase()).first(), !!opts?.resolve);
  }

  async save(
    repo: Repository | Repository[],
    opts?: { trx?: Knex.Transaction; onConflict: 'merge' | 'ignore' },
  ): Promise<void> {
    const repos = cloneDeep(Array.isArray(repo) ? repo : [repo]);
    const actors = extractEntityInstances<Actor>(repos, Actor as any);

    const transaction = opts?.trx || (await this.db.transaction());

    await Promise.all([
      this.actorRepo.save(actors, transaction),
      asyncIterator(repos, (repo) =>
        this.db
          .table(Repository.__collection_name)
          .insertEntity(repo)
          .onConflict('id')
          ?.[opts?.onConflict || 'merge']()
          .transacting(transaction),
      ),
    ])
      .then(async () => (!opts?.trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!opts?.trx) await transaction.rollback(error);
        throw error;
      });
  }
}

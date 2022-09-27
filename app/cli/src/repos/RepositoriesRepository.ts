import { all, each } from 'bluebird';
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
      const parsedRepo = new Repository({
        ...repo,
        funding_links: repo.funding_links && JSON.parse(repo.funding_links),
        languages: repo.languages && JSON.parse(repo.languages),
        repository_topics: repo.repository_topics && JSON.parse(repo.repository_topics),
      });

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

    await each(repos, async (repo) => {
      return all([
        this.actorRepo.save(actors, transaction),
        this.db
          .table(Repository.__collection_name)
          .insert(repo.toJSON('sqlite'))
          .onConflict('id')
          .merge()
          .transacting(transaction),
      ]);
    });

    if (!trx) await transaction.commit();
  }
}

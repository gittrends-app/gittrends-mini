import { all, each } from 'bluebird';
import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Tag } from '@gittrends/entities';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class TagsRepository implements IResourceRepository<Tag> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Tag.__collection_name)
      .where('repository', repository)
      .count('id', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Tag[]> {
    const tags = await this.db
      .table('tags')
      .select('*')
      .where('repository', repository)
      .orderBy('name', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return tags.map((tag) => new Tag(tag));
  }

  async save(tag: Tag | Tag[], trx?: Knex.Transaction): Promise<void> {
    const tags = (Array.isArray(tag) ? tag : [tag]).map(cloneDeep);
    const actors = extractEntityInstances<Actor>(tags, Actor as any);

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(actors, transaction),
      each(tags, (tag) =>
        this.db
          .table(Tag.__collection_name)
          .insertEntity(tag.toJSON())
          .onConflict(['id'])
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

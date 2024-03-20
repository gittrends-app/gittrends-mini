import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Entity, Tag } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class TagsRepository implements IResourceRepository<Tag> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table('tags')
      .where('repository', repository)
      .count('repository', { as: 'count' });
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

    return tags.map((tag) => Entity.tag(tag));
  }

  private async save(
    tag: Tag | Tag[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const tags = cloneDeep(Array.isArray(tag) ? tag : [tag]);
    const actors = extractActors(tags);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      asyncIterator(tags, (tag) =>
        this.db.table('tags').insertEntity(tag).onConflict(['id'])?.[onConflict]().transacting(transaction),
      ),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Tag | Tag[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Tag | Tag[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

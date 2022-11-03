import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Reaction } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class ReactionsRepository implements IResourceRepository<Reaction> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Reaction.__collection_name)
      .where('repository', repository)
      .count('user', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Reaction[]> {
    const reactions = await this.db
      .table(Reaction.__collection_name)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return reactions.map((reaction) => new Reaction(reaction));
  }

  async save(reaction: Reaction | Reaction[], trx?: Knex.Transaction): Promise<void> {
    const reactions = cloneDeep(Array.isArray(reaction) ? reaction : [reaction]);
    const actors = extractEntityInstances<Actor>(reactions, Actor as any);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.save(actors, { onConflict: 'ignore' }, transaction),
      asyncIterator(reactions, (reaction) => {
        return this.db
          .table(Reaction.__collection_name)
          .insertEntity(reaction)
          .onConflict('id')
          .ignore()
          .transacting(transaction);
      }),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

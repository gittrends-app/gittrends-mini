import { Knex } from 'knex';
import { cloneDeep, omit } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Entity, Reaction, User } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';

export class ReactionsRepository implements IResourceRepository<Reaction> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table('reactions')
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Reaction[]> {
    const reactions = await this.db
      .table('reactions')
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return reactions.map((reaction) => Entity.reaction({ __type: 'Reaction', ...reaction }));
  }

  private async save(
    reaction: Reaction | Reaction[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const reactions = cloneDeep(Array.isArray(reaction) ? reaction : [reaction]);
    const actors = extractActors(reactions) as User[];

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      asyncIterator(reactions, (reaction) => {
        return this.db
          .table('reactions')
          .insertEntity(omit(reaction, ['__type']))
          .onConflict('id')
          ?.[onConflict]()
          .transacting(transaction);
      }),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Reaction | Reaction[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Reaction | Reaction[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

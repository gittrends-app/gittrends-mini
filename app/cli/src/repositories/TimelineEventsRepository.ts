import { Knex } from 'knex';
import { cloneDeep, size } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Reaction, TimelineEvent } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';
import { ReactionsRepository } from './ReactionsRepository';

export class TimelineEventsRepository implements IResourceRepository<TimelineEvent> {
  private actorsRepo: ActorsRepository;
  private reactionsRepo: ReactionsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
    this.reactionsRepo = new ReactionsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(TimelineEvent.__name)
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(
    repository: string,
    opts?: { limit: number; skip: number } | undefined,
  ): Promise<TimelineEvent[]> {
    const events = await this.db
      .table(TimelineEvent.__name)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return events.map((event) => TimelineEvent.from(event));
  }

  private async save<T extends TimelineEvent>(
    event: T | T[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const events = cloneDeep(Array.isArray(event) ? event : [event]).map((event) => {
      const { id, repository, type, issue, ...payload } = event;
      return { id, repository, type, issue, payload: size(payload) > 0 ? payload : undefined };
    });

    const actors = extractEntityInstances<Actor>(events, Actor as any);
    const reactables = extractEntityInstances<Reaction>(events, Reaction);

    const transaction = trx || (await this.db.transaction());

    await Promise.all([
      this.actorsRepo.insert(actors, transaction),
      this.reactionsRepo.insert(reactables, transaction),
      asyncIterator(events, (event) =>
        this.db
          .table(TimelineEvent.__name)
          .insertEntity(event)
          .onConflict('id')
          ?.[onConflict]()
          .transacting(transaction),
      ),
    ])
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: TimelineEvent | TimelineEvent[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: TimelineEvent | TimelineEvent[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

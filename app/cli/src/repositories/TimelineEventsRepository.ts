import { all, each } from 'bluebird';
import { Knex } from 'knex';
import { cloneDeep, size } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Actor, Reaction, TimelineEvent } from '@gittrends/entities';

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
      .table(TimelineEvent.__collection_name)
      .where('repository', repository)
      .count('user', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(
    repository: string,
    opts?: { limit: number; skip: number } | undefined,
  ): Promise<TimelineEvent[]> {
    const events = await this.db
      .table(TimelineEvent.__collection_name)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return events.map((event) => TimelineEvent.from(event));
  }

  async save<T extends TimelineEvent>(event: T | T[], trx?: Knex.Transaction): Promise<void> {
    const events = (Array.isArray(event) ? event : [event]).map((event) => {
      const { id, repository, type, issue, ...payload } = cloneDeep(event);
      return { id, repository, type, issue, payload: size(payload) > 0 ? payload : undefined };
    });

    const actors = extractEntityInstances<Actor>(events, Actor as any);
    const reactables = extractEntityInstances<Reaction>(events, Reaction);

    const transaction = trx || (await this.db.transaction());

    await all([
      this.actorsRepo.save(actors, transaction),
      this.reactionsRepo.save(reactables, transaction),
      each(events, (event) =>
        this.db
          .table(TimelineEvent.__collection_name)
          .insertEntity(event)
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

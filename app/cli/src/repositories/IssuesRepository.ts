import { Knex } from 'knex';
import { cloneDeep } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Issue, IssueOrPull, PullRequest } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';
import { extractActors } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';
import { ReactionsRepository } from './ReactionsRepository';
import { TimelineEventsRepository } from './TimelineEventsRepository';

function transform<T extends IssueOrPull>(data: Record<string, any>): T {
  const { type, ...rest } = data;
  return { __type: type, ...rest } as T;
}

class IssueOrPullRepository<T extends IssueOrPull> implements IResourceRepository<T> {
  private actorsRepo: ActorsRepository;
  private reactionsRepo: ReactionsRepository;
  private eventsRepo: TimelineEventsRepository;

  constructor(
    private db: Knex,
    private type: 'issue' | 'pull_request',
  ) {
    this.actorsRepo = new ActorsRepository(db);
    this.reactionsRepo = new ReactionsRepository(db);
    this.eventsRepo = new TimelineEventsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(`${this.type}s`)
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]> {
    return this.db
      .table(`${this.type}s`)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0)
      .then((data) => data.map((v) => transform<T>(v)));
  }

  private async save(issue: T | T[], trx?: Knex.Transaction): Promise<void> {
    const data = cloneDeep(Array.isArray(issue) ? issue : [issue]).map((issue) => {
      const { __type, reactions, timeline_items, ...otherFields } = issue;
      const actors = extractActors(otherFields);

      if (!reactions || Array.isArray(reactions)) {
        Object.assign(otherFields, {
          reactions: Object.entries(otherFields.reaction_groups).reduce((acc, [, value]) => acc + value, 0),
        });
      }

      if (Array.isArray(timeline_items)) {
        Object.assign(otherFields, { timeline_items: timeline_items.length });
      }

      return {
        issue: Object.assign({ type: __type }, otherFields),
        actors,
        reactions: Array.isArray(reactions) ? reactions : [],
        timeline_items: Array.isArray(timeline_items) ? timeline_items : [],
      };
    });

    const transaction = trx || (await this.db.transaction());

    await asyncIterator(data, async ({ issue, actors, reactions, timeline_items }) =>
      Promise.all<void>([
        this.actorsRepo.insert(actors, transaction),
        this.reactionsRepo.insert(reactions, transaction),
        this.eventsRepo.insert(timeline_items, transaction),
        this.db.table(`${this.type}s`).insertEntity(issue).onConflict('id').merge().transacting(transaction),
      ]),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: T | T[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx);
  }

  upsert(entity: T | T[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx);
  }
}

export class IssuesRepository extends IssueOrPullRepository<Issue> {
  constructor(knex: Knex) {
    super(knex, 'issue');
  }
}

export class PullRequestsRepository extends IssueOrPullRepository<PullRequest> {
  constructor(knex: Knex) {
    super(knex, 'pull_request');
  }
}

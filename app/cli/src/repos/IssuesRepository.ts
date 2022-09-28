import { each } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Issue, IssueOrPull, PullRequest } from '@gittrends/lib';

import { extractEntityInstances } from '../helpers/extract';
import { ActorsRepository } from './ActorRepository';
import { ReactionsRepository } from './ReactionsRepository';
import { TimelineEventsRepository } from './TimelineEventsRepository';

class IssueOrPullRepository<T extends IssueOrPull> implements IResourceRepository<T> {
  private actorsRepo: ActorsRepository;
  private reactionsRepo: ReactionsRepository;
  private eventsRepo: TimelineEventsRepository;

  constructor(private db: Knex, private IssueOrPullClass: new (...args: any[]) => T) {
    this.actorsRepo = new ActorsRepository(db);
    this.reactionsRepo = new ReactionsRepository(db);
    this.eventsRepo = new TimelineEventsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table((this.IssueOrPullClass as any).__collection_name)
      .where('repository', repository)
      .count('id', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]> {
    const issues = await this.db
      .table((this.IssueOrPullClass as any).__collection_name)
      .select('*')
      .where('repository', repository)
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return issues.map(
      ({ assignees, participants, reaction_groups, labels, ...issue }) =>
        new this.IssueOrPullClass({
          ...issue,
          assignees: assignees && JSON.parse(assignees),
          participants: participants && JSON.parse(participants),
          labels: labels && JSON.parse(labels),
          reaction_groups: reaction_groups && JSON.parse(reaction_groups),
        }),
    );
  }

  async save(issue: T | T[], trx?: Knex.Transaction): Promise<void> {
    const data = (Array.isArray(issue) ? issue : [issue]).map((issue) => {
      const { reactions, timeline_items, ...otherFields } = issue;
      const actors = extractEntityInstances<Actor>(otherFields, Actor as any);
      if (Array.isArray(issue.reactions)) issue.reactions = issue.reactions.length;
      if (Array.isArray(issue.timeline_items)) issue.timeline_items = issue.timeline_items.length;

      return {
        issue: Object.assign(issue, otherFields),
        actors,
        reactions: Array.isArray(reactions) ? reactions : [],
        timeline_items: Array.isArray(timeline_items) ? timeline_items : [],
      };
    });

    const transaction = trx || (await this.db.transaction());

    await each(data, async ({ issue, actors, reactions, timeline_items }) => {
      await this.actorsRepo.save(actors, transaction);
      await this.reactionsRepo.save(reactions, transaction);
      await this.eventsRepo.save(timeline_items, transaction);
      return this.db
        .table((this.IssueOrPullClass as any).__collection_name)
        .insert(issue.toJSON('sqlite'))
        .onConflict('id')
        .merge()
        .transacting(transaction);
    })
      .then(async () => {
        if (!trx) await transaction.commit();
      })
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

export class IssuesRepository extends IssueOrPullRepository<Issue> {
  constructor(knex: Knex) {
    super(knex, Issue);
  }
}

export class PullRequestsRepository extends IssueOrPullRepository<PullRequest> {
  constructor(knex: Knex) {
    super(knex, PullRequest);
  }
}

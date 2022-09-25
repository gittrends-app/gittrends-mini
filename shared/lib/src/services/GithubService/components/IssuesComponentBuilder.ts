import { compact, flatten, get, isObjectLike } from 'lodash';

import { Actor } from '../../../entities';
import { Issue, IssueOrPull } from '../../../entities/Issue';
import { PullRequest } from '../../../entities/PullRequest';
import { Reaction } from '../../../entities/Reaction';
import { TimelineEvent } from '../../../entities/TimelineEvent';
import { Reactable, isntanceOfReactable } from '../../../entities/interfaces/Reactable';
import Component from '../../../github/Component';
import {
  IssueComponent,
  PullRequestComponent,
  ReactionComponent,
  RepositoryComponent,
} from '../../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

enum Stages {
  GET_ISSUES_LIST,
  GET_ISSUES_DETAILS,
  GET_TIMELINE_EVENTS,
  GET_REACTIONS,
}

type TMeta = { first: number; endCursor?: string; hasNextPage?: boolean };

class GenericBuilder<T extends IssueOrPull> implements ComponentBuilder<Component, T[]> {
  private Entity;
  private EntityComponent: typeof IssueComponent;

  private previousEndCursor: string | undefined;
  private currentStage: Stages = Stages.GET_ISSUES_LIST;

  private meta: TMeta = { first: 10 };
  private issuesMeta: (TMeta & { issue: T })[] = [];
  private reactablesMeta: (TMeta & { reactable: Reactable })[] = [];

  private get pendingReactables() {
    return this.reactablesMeta.filter((rm) => rm.hasNextPage).slice(this.meta.first);
  }

  constructor(private repositoryId: string, endCursor?: string, Class?: new (...args: any[]) => T) {
    this.meta.endCursor = this.previousEndCursor = endCursor;
    this.Entity = Class || Issue;
    this.EntityComponent = this.Entity === Issue ? IssueComponent : PullRequestComponent;
  }

  build(error?: Error): RepositoryComponent | IssueComponent[] | ReactionComponent[] {
    if (error) throw error;

    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const iFunc = this.Entity === Issue ? 'includeIssues' : 'includePullRequests';
        return new RepositoryComponent(this.repositoryId).setAlias('repo').includeDetails(false)[iFunc](true, {
          after: this.meta.endCursor,
          first: this.meta.first,
          alias: 'issues',
        });
      }

      case Stages.GET_ISSUES_DETAILS:
        return this.issuesMeta.map((iMeta, index) =>
          new this.EntityComponent(iMeta.issue.id, `issue_${index}`)
            .includeDetails(true)
            .includeAssignees(true, { first: 100, alias: '_assignees' })
            .includeLabels(true, { first: 100, alias: '_labels' })
            .includeParticipants(true, { first: 100, alias: '_participants' }),
        );

      case Stages.GET_TIMELINE_EVENTS:
        return this.issuesMeta.map((iMeta, index) =>
          new this.EntityComponent(iMeta.issue.id, `issue_${index}`)
            .includeDetails(false)
            .includeTimeline(true, { first: 100, after: iMeta.endCursor, alias: 'tl' }),
        );

      case Stages.GET_REACTIONS:
        return this.pendingReactables.map((pr, index) =>
          new ReactionComponent((pr.reactable as any).id, `reactable_${index}`).includeReactions(true, {
            first: pr.first,
            after: pr.endCursor,
          }),
        );

      default:
        throw new Error(`Unknown stage "${this.currentStage}"`);
    }
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: T[] } {
    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const nodes = get<any[]>(data, 'repo.issues.nodes', []);
        this.issuesMeta = nodes.map((issue) => ({ issue, first: 100, hasNextPage: true }));

        const pageInfo = get(data, 'repo.issues.page_info', {});
        this.meta.hasNextPage = get(pageInfo, 'has_next_page', false);
        this.meta.endCursor = get(pageInfo, 'end_cursor', (this.previousEndCursor = this.meta.endCursor));

        if (nodes.length === 0) return { hasNextPage: false, data: [], endCursor: this.meta.endCursor };

        this.currentStage = Stages.GET_ISSUES_DETAILS;
        break;
      }

      case Stages.GET_ISSUES_DETAILS: {
        this.issuesMeta.forEach((iMeta, index) => {
          const { _assignees, _labels, _participants, ...iData } = data?.[`issue_${index}`] || {};

          const assignees = get<any[]>(_assignees, 'nodes', []).map((a) => Actor.from(a));
          const labels = get<any[]>(_labels, 'nodes', []);
          const participants = get<any[]>(_participants, 'nodes', []).map((p) => Actor.from(p));

          iMeta.issue = new this.Entity({
            suggested_reviewers: [],
            ...iData,
            repository: this.repositoryId,
            reactions: [],
            timeline_items: [],
            assignees,
            labels,
            participants,
          }) as T;
        });

        this.currentStage = Stages.GET_TIMELINE_EVENTS;
        break;
      }

      case Stages.GET_TIMELINE_EVENTS: {
        const hasMoreTimelineEvents = this.issuesMeta.reduce((hasMore, iMeta, index) => {
          const nodes = get<any[]>(data, `issue_${index}.tl.nodes`, [])
            .map((node) => transformTimelineEvent(node))
            .map((node) => TimelineEvent.from({ ...node, repository: this.repositoryId, issue: iMeta.issue.id }));

          const pageInfo = get(data, `issue_${index}.tl.page_info`, {});
          iMeta.endCursor = pageInfo.end_cursor || iMeta.endCursor;
          iMeta.hasNextPage = pageInfo.has_next_page || false;

          (iMeta.issue.timeline_items as TimelineEvent[]).push(...nodes);

          return iMeta.hasNextPage || hasMore;
        }, false);

        if (!hasMoreTimelineEvents) {
          const reactables = findReactables(
            flatten(compact(this.issuesMeta.map((iMeta) => iMeta.issue.timeline_items as TimelineEvent[]))),
          ).map((reactable) => {
            reactable.reactions = [];
            return reactable;
          });

          if (reactables.length === 0) {
            this.currentStage = Stages.GET_ISSUES_LIST;
            return {
              hasNextPage: true,
              endCursor: this.meta.endCursor,
              data: this.issuesMeta.map((iMeta) => iMeta.issue),
            };
          }

          this.reactablesMeta = reactables.map((reactable) => ({ reactable, first: 100, hasNextPage: true }));
          this.currentStage = Stages.GET_REACTIONS;
        }
        break;
      }

      case Stages.GET_REACTIONS: {
        const hasMoreReactions = this.pendingReactables.reduce((hasMore, pr, index) => {
          const nodes = get<any[]>(data, `reactable_${index}.reactions.nodes`, []).map(
            (data) => new Reaction({ ...data, repository: this.repositoryId, reactable: pr.reactable.id }),
          );

          (pr.reactable.reactions as Reaction[]).push(...nodes);
          pr.hasNextPage = get<boolean>(data, `reactable_${index}.page_info.has_next_page`, false);
          pr.endCursor = get<string | undefined>(data, `reactable_${index}.page_info.end_cursor`, pr.endCursor);

          return pr.hasNextPage || hasMore;
        }, false);

        if (!hasMoreReactions) {
          this.currentStage = Stages.GET_ISSUES_LIST;
          return {
            hasNextPage: true,
            endCursor: this.meta.endCursor,
            data: this.issuesMeta.map((iMeta) => iMeta.issue),
          };
        }
        break;
      }

      default:
        throw new Error(`Unknown Stage "${this.currentStage}"`);
    }

    return { hasNextPage: true, endCursor: this.previousEndCursor, data: [] };
  }
}

function transformTimelineEvent(data: any): any {
  if (data.reaction_groups) {
    data.reactions = Object.values(data.reaction_groups).reduce((sum: number, v: any) => sum + v, 0);
  }

  if (
    data.type === 'PullRequestCommitCommentThread' ||
    data.type === 'PullRequestReview' ||
    data.type === 'PullRequestReviewThread'
  ) {
    data.comments = data.comments?.nodes;
  }

  if (data.type === 'Deployment') {
    data.statuses = data.statuses?.nodes;
  }

  return data;
}

function findReactables(data: any | any[]): Reactable[] {
  if (Array.isArray(data)) return flatten(data.map(findReactables));
  else if (isObjectLike(data))
    return [...(isntanceOfReactable(data) ? [data] : []), ...flatten(Object.values(data).map(findReactables))];
  else if (isntanceOfReactable(data)) return [data];
  else return [];
}

export class IssuesComponentBuilder extends GenericBuilder<Issue> {
  constructor(repositoryId: string, endCursor?: string) {
    super(repositoryId, endCursor, Issue);
  }
}

export class PullRequestsComponentBuilder extends GenericBuilder<PullRequest> {
  constructor(repositoryId: string, endCursor?: string) {
    super(repositoryId, endCursor, PullRequest);
  }
}
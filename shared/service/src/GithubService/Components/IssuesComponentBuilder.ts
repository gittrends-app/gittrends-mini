import { compact, flatten, get, isObjectLike, size } from 'lodash';

import {
  Component,
  GithubRequestError,
  IssueComponent,
  PullRequestComponent,
  ReactionComponent,
  RepositoryComponent,
  ServerRequestError,
} from '@gittrends/github';

import {
  Actor,
  Issue,
  IssueOrPull,
  PullRequest,
  Reactable,
  Reaction,
  TimelineEvent,
  isntanceOfReactable,
} from '@gittrends/entities';

import { ComponentBuilder } from '../ComponentBuilder';

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

  protected defaultBatchSize = 25;

  private meta: TMeta = { first: this.defaultBatchSize };
  private issuesMeta: (TMeta & { issue: T })[] = [];
  private reactablesMeta: (TMeta & { reactable: Reactable })[] = [];

  private get pendingIssues() {
    return this.issuesMeta.filter((rm) => rm.hasNextPage).slice(0, this.meta.first);
  }

  private get pendingReactables() {
    return this.reactablesMeta.filter((rm) => rm.hasNextPage).slice(0, this.meta.first);
  }

  constructor(private repositoryId: string, endCursor?: string, Class?: new (...args: any[]) => T) {
    this.meta.endCursor = this.previousEndCursor = endCursor;
    this.Entity = Class || Issue;
    this.EntityComponent = this.Entity === Issue ? IssueComponent : PullRequestComponent;
  }

  private errorHandler(error: Error) {
    if (!error) return;

    const isGithubRequestError = error.name === GithubRequestError.name;
    const isServerRequestError = error.name === ServerRequestError.name;

    if (isGithubRequestError || isServerRequestError) {
      if (this.meta.first > 1) {
        return (this.meta.first = Math.floor(this.meta.first / 2));
      }
      if (this.meta.first === 1 && this.currentStage == Stages.GET_TIMELINE_EVENTS) {
        if (this.pendingIssues[0].first > 1)
          return (this.pendingIssues[0].first = Math.floor(this.pendingIssues[0].first / 2));
        else if (this.pendingIssues[0].first === 1 && isGithubRequestError) {
          return (this.pendingIssues[0].hasNextPage = false);
        }
      }
    }

    throw error;
  }

  build(error?: Error): RepositoryComponent | IssueComponent[] | ReactionComponent[] {
    if (error) this.errorHandler(error);

    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const iFunc = this.Entity === Issue ? 'includeIssues' : 'includePullRequests';
        return new RepositoryComponent(this.repositoryId).setAlias('repo').includeDetails(false)[iFunc](true, {
          after: this.meta.endCursor,
          first: this.meta.first,
          alias: 'issues',
        });
      }

      case Stages.GET_ISSUES_DETAILS: {
        return this.issuesMeta.map((iMeta, index) =>
          new this.EntityComponent(iMeta.issue.id, `issue_${index}`)
            .includeDetails(true)
            .includeAssignees(true, { first: 100, alias: '_assignees' })
            .includeLabels(true, { first: 100, alias: '_labels' })
            .includeParticipants(true, { first: 100, alias: '_participants' }),
        );
      }

      case Stages.GET_TIMELINE_EVENTS: {
        return this.pendingIssues.map((iMeta, index) =>
          new this.EntityComponent(iMeta.issue.id, `issue_${index}`)
            .includeDetails(false)
            .includeTimeline(true, { first: iMeta.first, after: iMeta.endCursor, alias: 'tl' }),
        );
      }

      case Stages.GET_REACTIONS: {
        return this.pendingReactables.map((pr, index) =>
          new ReactionComponent((pr.reactable as any).id, `reactable_${index}`).includeReactions(true, {
            first: pr.first,
            after: pr.endCursor,
          }),
        );
      }

      default:
        throw new Error(`Unknown stage "${this.currentStage}"`);
    }
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: T[] } {
    this.meta.first = Math.min(this.defaultBatchSize, this.meta.first * 2);

    switch (this.currentStage) {
      case Stages.GET_ISSUES_LIST: {
        const nodes = get<any[]>(data, 'repo.issues.nodes', []);
        this.issuesMeta = nodes.map((issue) => ({ issue, first: 50, hasNextPage: true }));

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
        this.pendingIssues.forEach((iMeta, index) => {
          iMeta.first = Math.min(50, iMeta.first * 2);

          const nodes = get<any[]>(data, `issue_${index}.tl.nodes`, [])
            .map((node) => transformTimelineEvent(node, { repository: this.repositoryId, issue: iMeta.issue.id }))
            .map((node) => TimelineEvent.from({ ...node, repository: this.repositoryId, issue: iMeta.issue.id }));

          const pageInfo = get(data, `issue_${index}.tl.page_info`, {});
          iMeta.endCursor = pageInfo.end_cursor || iMeta.endCursor;
          iMeta.hasNextPage = pageInfo.has_next_page || false;

          (iMeta.issue.timeline_items as TimelineEvent[]).push(...nodes);
        });

        if (this.issuesMeta.every((iMeta) => !iMeta.hasNextPage)) {
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
        this.pendingReactables.forEach((pr, index) => {
          const nodes = get<any[]>(data, `reactable_${index}.reactions.nodes`, []).map(
            (data) =>
              new Reaction({
                ...data,
                repository: this.repositoryId,
                reactable: pr.reactable.id,
                reactable_type: pr.reactable.constructor.name,
              }),
          );

          (pr.reactable.reactions as Reaction[]).push(...nodes);
          pr.hasNextPage = get<boolean>(data, `reactable_${index}.page_info.has_next_page`, false);
          pr.endCursor = get<string | undefined>(data, `reactable_${index}.page_info.end_cursor`, pr.endCursor);
        });

        if (this.reactablesMeta.every((rMeta) => !rMeta.hasNextPage)) {
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

  toJSON() {
    const data = { repository: this.repositoryId, endCursor: this.previousEndCursor, currentStage: this.currentStage };

    if (this.currentStage === Stages.GET_ISSUES_LIST) {
      Object.assign(data, this.meta);
    } else if (this.currentStage === Stages.GET_ISSUES_DETAILS || this.currentStage === Stages.GET_TIMELINE_EVENTS) {
      Object.assign(data, {
        meta: this.pendingIssues.map(({ first, endCursor, hasNextPage }) => ({ first, endCursor, hasNextPage })),
      });
    } else {
      Object.assign(data, {
        meta: this.pendingReactables.map(({ first, endCursor, hasNextPage }) => ({ first, endCursor, hasNextPage })),
      });
    }

    return data;
  }
}

function transformTimelineEvent(data: any, opts: { repository: string; issue: string }): any {
  if (data.reaction_groups) {
    data.reactions = Object.values(data.reaction_groups).reduce((sum: number, v: any) => sum + v, 0);
  }

  if (
    data.type === 'PullRequestCommitCommentThread' ||
    data.type === 'PullRequestReview' ||
    data.type === 'PullRequestReviewThread'
  ) {
    data.comments = data.comments ? data.comments.nodes.map((comment: any) => ({ ...opts, ...comment })) : [];
  }

  if (data.pull_request_commit && size(data.pull_request_commit) === 1)
    data.pull_request_commit = data.pull_request_commit.commit;

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
  protected defaultBatchSize = 15;

  constructor(repositoryId: string, endCursor?: string) {
    super(repositoryId, endCursor, PullRequest);
  }
}

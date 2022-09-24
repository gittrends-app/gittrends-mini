/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor } from './Actor';
import { Entity } from './Entity';
import { Reaction } from './Reaction';
import { Repository } from './Repository';
import { TimelineEvent } from './TimelineEvent';
import { Node } from './interfaces/Node';
import { Reactable } from './interfaces/Reactable';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Issue extends Entity<Issue> implements Node, RepositoryResource, Reactable {
  id!: string;
  repository!: string | Repository;
  type!: 'Issue' | 'PullRequest';
  active_lock_reason?: string;
  assignees?: string[] | Actor[];
  author?: string | Actor;
  author_association!: string;
  body!: string;
  closed!: boolean;
  closed_at?: Date;
  created_at!: Date;
  created_via_email!: boolean;
  editor?: string | Actor;
  includes_created_edit!: boolean;
  is_pinned?: boolean;
  labels?: string[];
  last_edited_at?: Date;
  locked!: boolean;
  milestone?: string;
  number!: number;
  participants?: string[] | Actor[];
  published_at?: Date;
  reaction_groups!: Record<string, number>;
  reactions!: number | Reaction[];
  state!: string;
  state_reason?: string;
  timeline_items!: number | TimelineEvent[];
  title!: string;
  tracked_in_issues!: number;
  tracked_issues!: number;
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Issue> {
    return Joi.object<Issue>({
      id: Joi.string().required(),
      repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
      reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()).required(),
      reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)).required(),
      type: Joi.string().valid('Issue', 'PullRequest').required(),
      active_lock_reason: Joi.string(),
      assignees: Joi.alternatives(Joi.array().items(Joi.string()), Joi.array().items(Actor.__schema)),
      author: Joi.alternatives(Joi.string(), Actor.__schema),
      author_association: Joi.string().required(),
      body: Joi.string().required(),
      closed: Joi.boolean().required(),
      closed_at: Joi.date(),
      created_at: Joi.date().required(),
      created_via_email: Joi.boolean().required(),
      editor: Joi.alternatives(Joi.string(), Actor.__schema),
      includes_created_edit: Joi.boolean().required(),
      is_pinned: Joi.boolean(),
      labels: Joi.array().items(Joi.string()),
      last_edited_at: Joi.date(),
      locked: Joi.boolean().required(),
      milestone: Joi.string(),
      number: Joi.number().required(),
      participants: Joi.alternatives(Joi.array().items(Joi.string()), Joi.array().items(Actor.__schema)),
      published_at: Joi.date(),
      state: Joi.string().required(),
      state_reason: Joi.string(),
      timeline_items: Joi.alternatives(Joi.number(), Joi.array().items(TimelineEvent.__schema)).required(),
      title: Joi.string(),
      tracked_in_issues: Joi.number().required(),
      tracked_issues: Joi.number().required(),
      updated_at: Joi.date().required(),
    }).custom((value) => Object.assign(new Issue(), value));
  }
}

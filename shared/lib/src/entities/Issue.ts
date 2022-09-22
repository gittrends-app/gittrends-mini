/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor } from './Actor';
import Reaction from './Reaction';
import { RepositoryResource } from './Repository';
import { TimelineEvent } from './TimelineEvent/TimelineEvent';

export class Issue extends RepositoryResource {
  id!: string;
  type!: 'Issue' | 'PullRequest';
  active_lock_reason?: string;
  author?: string | Actor;
  author_association?: string;
  body?: string;
  closed?: boolean;
  closed_at?: Date;
  created_at?: Date;
  created_via_email?: boolean;
  database_id?: number;
  editor?: string | Actor;
  includes_created_edit?: boolean;
  last_edited_at?: Date;
  locked?: boolean;
  milestone?: string;
  number?: number;
  published_at?: Date;
  state?: string;
  title?: string;
  updated_at?: Date;
  assignees?: string[] | Actor[];
  labels?: string[];
  participants?: string[] | Actor[];
  reaction_groups?: Record<string, number>;

  // local fields
  reactions?: number | Reaction[];
  timeline_events?: number | TimelineEvent[];

  public static get __schema(): Joi.ObjectSchema<Issue> {
    return super.__schema
      .append<Issue>({
        id: Joi.string().required(),
        type: Joi.string().valid('Issue', 'PullRequest').required(),
        active_lock_reason: Joi.string(),
        author: Joi.alternatives(Joi.string(), Actor.__schema),
        author_association: Joi.string(),
        body: Joi.string(),
        closed: Joi.boolean(),
        closed_at: Joi.date(),
        created_at: Joi.date(),
        created_via_email: Joi.boolean(),
        database_id: Joi.number(),
        editor: Joi.alternatives(Joi.string(), Actor.__schema),
        includes_created_edit: Joi.boolean(),
        last_edited_at: Joi.date(),
        locked: Joi.boolean(),
        milestone: Joi.string(),
        number: Joi.number(),
        published_at: Joi.date(),
        state: Joi.string(),
        title: Joi.string(),
        updated_at: Joi.date(),
        assignees: Joi.alternatives(Joi.array().items(Joi.string()), Joi.array().items(Actor.__schema)),
        labels: Joi.array().items(Joi.string()),
        participants: Joi.alternatives(Joi.array().items(Joi.string()), Joi.array().items(Actor.__schema)),
        reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()),
        reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)),
        timeline_events: Joi.alternatives(Joi.number(), Joi.array().items(TimelineEvent.__schema)),
      })
      .custom((value) => new Issue(value));
  }
}

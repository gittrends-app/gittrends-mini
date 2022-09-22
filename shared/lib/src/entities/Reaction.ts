/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor } from './Actor';
import { Issue } from './Issue';
import { PullRequest } from './PullRequest';
import { RepositoryResource } from './Repository';
import { TimelineEvent } from './TimelineEvent/TimelineEvent';

export default class Reaction extends RepositoryResource {
  id!: string;
  issue!: string | Issue | PullRequest;
  event?: string | TimelineEvent;
  content!: string;
  created_at!: Date;
  user?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<Reaction> {
    return super.__schema
      .append<Reaction>({
        id: Joi.string().required(),
        issue: Joi.alternatives(Joi.string(), Issue.__schema, PullRequest.__schema).required(),
        event: Joi.alternatives(Joi.string(), TimelineEvent.__schema),
        content: Joi.string().required(),
        created_at: Joi.date(),
        user: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => new Reaction(value));
  }
}

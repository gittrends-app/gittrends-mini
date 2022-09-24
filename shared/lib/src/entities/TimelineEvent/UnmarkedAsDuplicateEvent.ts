import Joi from 'joi';

import { Actor } from '../Actor';
import { Issue } from '../Issue';
import { PullRequest } from '../PullRequest';
import { TimelineEvent } from '../TimelineEvent';

export default class UnmarkedAsDuplicateEvent extends TimelineEvent {
  actor?: string | Actor;
  canonical?: string | Issue | PullRequest;
  created_at!: Date;
  duplicate?: string | Issue | PullRequest;
  is_cross_repository!: boolean;

  public static get __schema(): Joi.ObjectSchema<UnmarkedAsDuplicateEvent> {
    return super.__schema
      .append<UnmarkedAsDuplicateEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        canonical: Joi.alternatives(Joi.string(), PullRequest.__schema, Issue.__schema),
        created_at: Joi.date().required(),
        duplicate: Joi.alternatives(Joi.string(), PullRequest.__schema, Issue.__schema),
        is_cross_repository: Joi.boolean().required(),
      })
      .custom((value) => Object.assign(new UnmarkedAsDuplicateEvent(), value));
  }
}

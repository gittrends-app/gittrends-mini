import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class ReviewRequestedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  requested_reviewer?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<ReviewRequestedEvent> {
    return super.__schema
      .append<ReviewRequestedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        requested_reviewer: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => Object.assign(new ReviewRequestedEvent(), value));
  }
}

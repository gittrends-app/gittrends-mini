import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class LockedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  lock_reason?: string;

  public static get __schema(): Joi.ObjectSchema<LockedEvent> {
    return super.__schema
      .append<LockedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        lock_reason: Joi.string(),
      })
      .custom((value) => Object.assign(new LockedEvent(), value));
  }
}

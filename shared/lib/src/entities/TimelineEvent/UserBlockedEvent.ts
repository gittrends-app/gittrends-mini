import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class UserBlockedEvent extends TimelineEvent {
  actor?: string | Actor;
  block_duration!: string;
  created_at!: Date;
  subject?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<UserBlockedEvent> {
    return super.__schema
      .append<UserBlockedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        block_duration: Joi.string().required(),
        created_at: Joi.date().required(),
        subject: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => new UserBlockedEvent(value));
  }
}

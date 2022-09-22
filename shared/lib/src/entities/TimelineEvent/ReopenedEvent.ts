import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class ReopenedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  state_reason?: string;

  public static get __schema(): Joi.ObjectSchema<ReopenedEvent> {
    return super.__schema
      .append<ReopenedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        state_reason: Joi.string(),
      })
      .custom((value) => new ReopenedEvent(value));
  }
}

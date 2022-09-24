import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class UnsubscribedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<UnsubscribedEvent> {
    return super.__schema
      .append<UnsubscribedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new UnsubscribedEvent(), value));
  }
}

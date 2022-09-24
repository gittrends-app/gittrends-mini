import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class SubscribedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<SubscribedEvent> {
    return super.__schema
      .append<SubscribedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new SubscribedEvent(), value));
  }
}

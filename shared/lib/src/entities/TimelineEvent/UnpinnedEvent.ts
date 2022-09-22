import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class UnpinnedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<UnpinnedEvent> {
    return super.__schema
      .append<UnpinnedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => new UnpinnedEvent(value));
  }
}

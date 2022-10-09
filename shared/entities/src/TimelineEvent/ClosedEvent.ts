import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class ClosedEvent extends TimelineEvent {
  actor?: string | Actor;
  closer?: { id: string; type: string; commit?: string };
  created_at!: Date;
  state_reason?: string;

  public static get __schema(): Joi.ObjectSchema<ClosedEvent> {
    return super.__schema
      .append<ClosedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        closer: Joi.object({ id: Joi.string().required(), type: Joi.string().required(), commit: Joi.string() }),
        created_at: Joi.date().required(),
        state_reason: Joi.string(),
      })
      .custom((value) => Object.assign(new ClosedEvent(), value));
  }
}

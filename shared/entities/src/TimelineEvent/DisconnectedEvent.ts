import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class DisconnectedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  is_cross_repository!: boolean;
  source!: { id: string; type: string };
  subject!: { id: string; type: string };

  public static get __schema(): Joi.ObjectSchema<DisconnectedEvent> {
    return super.__schema
      .append<DisconnectedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        is_cross_repository: Joi.boolean().required(),
        source: Joi.object({ id: Joi.string(), type: Joi.string() }).required(),
        subject: Joi.object({ id: Joi.string(), type: Joi.string() }).required(),
      })
      .custom((value) => Object.assign(new DisconnectedEvent(), value));
  }
}

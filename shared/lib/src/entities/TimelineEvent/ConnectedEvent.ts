import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class ConnectedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  is_cross_repository!: boolean;
  source!: { id: string; type: string };
  subject!: { id: string; type: string };

  public static get __schema(): Joi.ObjectSchema<ConnectedEvent> {
    return super.__schema
      .append<ConnectedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        is_cross_repository: Joi.boolean().required(),
        source: Joi.object({ id: Joi.string(), type: Joi.string() }).required(),
        subject: Joi.object({ id: Joi.string(), type: Joi.string() }).required(),
      })
      .custom((value) => new ConnectedEvent(value));
  }
}

import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class DeployedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  deployment!: string;
  ref?: { name: string; target: string };

  public static get __schema(): Joi.ObjectSchema<DeployedEvent> {
    return super.__schema
      .append<DeployedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        deployment: Joi.string().required(),
        ref: Joi.object({ name: Joi.string(), target: Joi.string() }),
      })
      .custom((value) => new DeployedEvent(value));
  }
}

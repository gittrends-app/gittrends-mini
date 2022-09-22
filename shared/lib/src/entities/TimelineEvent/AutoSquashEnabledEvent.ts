import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AutoSquashEnabledEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  enabler?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<AutoSquashEnabledEvent> {
    return super.__schema
      .append<AutoSquashEnabledEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        enabler: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => new AutoSquashEnabledEvent(value));
  }
}

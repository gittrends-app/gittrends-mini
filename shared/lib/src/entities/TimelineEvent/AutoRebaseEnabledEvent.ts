import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AutoRebaseEnabledEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  enabler?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<AutoRebaseEnabledEvent> {
    return super.__schema
      .append<AutoRebaseEnabledEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        enabler: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => new AutoRebaseEnabledEvent(value));
  }
}

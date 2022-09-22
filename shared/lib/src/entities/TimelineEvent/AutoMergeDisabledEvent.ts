import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AutoMergeDisabledEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  disabler?: string | Actor;
  reason?: string;
  reason_code?: string;

  public static get __schema(): Joi.ObjectSchema<AutoMergeDisabledEvent> {
    return super.__schema
      .append<AutoMergeDisabledEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        disabler: Joi.alternatives(Joi.string(), Actor.__schema),
        reason: Joi.string(),
        reason_code: Joi.string(),
      })
      .custom((value) => new AutoMergeDisabledEvent(value));
  }
}

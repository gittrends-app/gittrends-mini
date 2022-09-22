import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class BaseRefDeletedEvent extends TimelineEvent {
  actor?: string | Actor;
  base_ref_name?: string;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<BaseRefDeletedEvent> {
    return super.__schema
      .append<BaseRefDeletedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        base_ref_name: Joi.string(),
        created_at: Joi.date().required(),
      })
      .custom((value) => new BaseRefDeletedEvent(value));
  }
}

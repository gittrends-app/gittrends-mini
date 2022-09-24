import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class BaseRefChangedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  current_ref_name!: string;
  previous_ref_name!: string;

  public static get __schema(): Joi.ObjectSchema<BaseRefChangedEvent> {
    return super.__schema
      .append<BaseRefChangedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        current_ref_name: Joi.string().required(),
        previous_ref_name: Joi.string().required(),
      })
      .custom((value) => Object.assign(new BaseRefChangedEvent(), value));
  }
}

import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class ConvertToDraftEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<ConvertToDraftEvent> {
    return super.__schema
      .append<ConvertToDraftEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new ConvertToDraftEvent(), value));
  }
}

import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class RenamedTitleEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  current_title!: string;
  previous_title!: string;

  public static get __schema(): Joi.ObjectSchema<RenamedTitleEvent> {
    return super.__schema
      .append<RenamedTitleEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        current_title: Joi.string().required(),
        previous_title: Joi.string().default('').required(),
      })
      .custom((value) => Object.assign(new RenamedTitleEvent(), value));
  }
}

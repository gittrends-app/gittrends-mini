import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class DemilestonedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  milestone_title!: string;

  public static get __schema(): Joi.ObjectSchema<DemilestonedEvent> {
    return super.__schema
      .append<DemilestonedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        milestone_title: Joi.string().required(),
      })
      .custom((value) => Object.assign(new DemilestonedEvent(), value));
  }
}

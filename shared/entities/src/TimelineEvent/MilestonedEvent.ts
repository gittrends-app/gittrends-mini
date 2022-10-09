import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class MilestonedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  milestone_title!: string;

  public static get __schema(): Joi.ObjectSchema<MilestonedEvent> {
    return super.__schema
      .append<MilestonedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        milestone_title: Joi.string().required(),
      })
      .custom((value) => Object.assign(new MilestonedEvent(), value));
  }
}

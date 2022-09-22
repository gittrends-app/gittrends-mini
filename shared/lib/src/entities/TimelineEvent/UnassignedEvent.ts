import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class UnassignedEvent extends TimelineEvent {
  actor?: string | Actor;
  assignee?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<UnassignedEvent> {
    return super.__schema
      .append<UnassignedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        assignee: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => new UnassignedEvent(value));
  }
}

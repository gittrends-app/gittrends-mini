import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AssignedEvent extends TimelineEvent {
  actor?: string | Actor;
  assignee?: string | Actor;
  created_at!: Date;

  public static get __schema(): Joi.ObjectSchema<AssignedEvent> {
    return super.__schema
      .append<AssignedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        assignee: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
      })
      .custom((value) => new AssignedEvent(value));
  }
}

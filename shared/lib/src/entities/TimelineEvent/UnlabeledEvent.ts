import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class UnlabeledEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  label!: string;

  public static get __schema(): Joi.ObjectSchema<UnlabeledEvent> {
    return super.__schema
      .append<UnlabeledEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        label: Joi.string().required(),
      })
      .custom((value) => new UnlabeledEvent(value));
  }
}

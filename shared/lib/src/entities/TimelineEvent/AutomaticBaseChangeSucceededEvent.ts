import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AutomaticBaseChangeSucceededEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  new_base!: string;
  old_base!: string;

  public static get __schema(): Joi.ObjectSchema<AutomaticBaseChangeSucceededEvent> {
    return super.__schema
      .append<AutomaticBaseChangeSucceededEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        new_base: Joi.string().required(),
        old_base: Joi.string().required(),
      })
      .custom((value) => new AutomaticBaseChangeSucceededEvent(value));
  }
}

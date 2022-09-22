import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class HeadRefDeletedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  head_ref?: { name: string; target: string };
  head_ref_name!: string;

  public static get __schema(): Joi.ObjectSchema<HeadRefDeletedEvent> {
    return super.__schema
      .append<HeadRefDeletedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        head_ref: Joi.object({ name: Joi.string(), target: Joi.string() }),
        head_ref_name: Joi.string().required(),
      })
      .custom((value) => new HeadRefDeletedEvent(value));
  }
}

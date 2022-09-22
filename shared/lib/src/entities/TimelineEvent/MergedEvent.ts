import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class MergedEvent extends TimelineEvent {
  actor?: string | Actor;
  commit?: string;
  created_at!: Date;
  merge_ref?: { name: string; target: string };
  merge_ref_name!: string;

  public static get __schema(): Joi.ObjectSchema<MergedEvent> {
    return super.__schema
      .append<MergedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        commit: Joi.string(),
        created_at: Joi.date().required(),
        merge_ref: Joi.object({ name: Joi.string(), target: Joi.string() }),
        merge_ref_name: Joi.string().required(),
      })
      .custom((value) => new MergedEvent(value));
  }
}

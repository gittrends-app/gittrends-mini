import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class CrossReferencedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  is_cross_repository!: boolean;
  referenced_at!: Date;
  source!: { type: string; id: string };
  target!: { type: string; id: string };
  url!: string;
  will_close_target!: boolean;

  public static get __schema(): Joi.ObjectSchema<CrossReferencedEvent> {
    return super.__schema
      .append<CrossReferencedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        is_cross_repository: Joi.boolean().required(),
        referenced_at: Joi.date().required(),
        source: Joi.object({ type: Joi.string(), id: Joi.string() }).required(),
        target: Joi.object({ type: Joi.string(), id: Joi.string() }).required(),
        url: Joi.string().required(),
        will_close_target: Joi.boolean().required(),
      })
      .custom((value) => new CrossReferencedEvent(value));
  }
}

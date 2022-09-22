import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class BaseRefForcePushedEvent extends TimelineEvent {
  actor?: string | Actor;
  after_commit?: string;
  before_commit?: string;
  created_at!: Date;
  ref?: { name: string; target: string };

  public static get __schema(): Joi.ObjectSchema<BaseRefForcePushedEvent> {
    return super.__schema
      .append<BaseRefForcePushedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        after_commit: Joi.string(),
        before_commit: Joi.string(),
        created_at: Joi.date().required(),
        ref: Joi.object({ name: Joi.string(), target: Joi.string() }),
      })
      .custom((value) => new BaseRefForcePushedEvent(value));
  }
}

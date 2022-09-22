import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class ReferencedEvent extends TimelineEvent {
  actor?: string | Actor;
  commit?: string;
  commit_repository!: string;
  created_at!: Date;
  is_cross_repository!: boolean;
  is_direct_reference!: boolean;

  public static get __schema(): Joi.ObjectSchema<ReferencedEvent> {
    return super.__schema
      .append<ReferencedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        commit: Joi.string(),
        commit_repository: Joi.string().required(),
        created_at: Joi.date().required(),
        is_cross_repository: Joi.boolean().required(),
        is_direct_reference: Joi.boolean().required(),
      })
      .custom((value) => new ReferencedEvent(value));
  }
}

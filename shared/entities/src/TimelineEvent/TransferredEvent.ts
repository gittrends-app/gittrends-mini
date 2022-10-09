import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class TransferredEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  from_repository?: { id: string; name_with_owner: string };

  public static get __schema(): Joi.ObjectSchema<TransferredEvent> {
    return super.__schema
      .append<TransferredEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        from_repository: Joi.object({ id: Joi.string(), name_with_owner: Joi.string() }),
      })
      .custom((value) => Object.assign(new TransferredEvent(), value));
  }
}

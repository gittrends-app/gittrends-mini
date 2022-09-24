import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class LabeledEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  label!: string;

  public static get __schema(): Joi.ObjectSchema<LabeledEvent> {
    return super.__schema
      .append<LabeledEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        label: Joi.string().required(),
      })
      .custom((value) => Object.assign(new LabeledEvent(), value));
  }
}

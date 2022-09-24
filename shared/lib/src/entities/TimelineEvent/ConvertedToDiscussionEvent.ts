import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from '../TimelineEvent';

export default class ConvertedToDiscussionEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  discussion?: string;

  public static get __schema(): Joi.ObjectSchema<ConvertedToDiscussionEvent> {
    return super.__schema
      .append<ConvertedToDiscussionEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        discussion: Joi.string(),
      })
      .custom((value) => Object.assign(new ConvertedToDiscussionEvent(), value));
  }
}

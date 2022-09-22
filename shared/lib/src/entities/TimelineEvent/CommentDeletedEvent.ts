import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class CommentDeletedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  deleted_comment_author?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<CommentDeletedEvent> {
    return super.__schema
      .append<CommentDeletedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        deleted_comment_author: Joi.alternatives(Joi.string(), Actor.__schema),
      })
      .custom((value) => new CommentDeletedEvent(value));
  }
}

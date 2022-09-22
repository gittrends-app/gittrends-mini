import Joi from 'joi';

import { Actor } from '../Actor';
import { Comment } from './Comment';
import { Reactable } from './Reactable';
import { TimelineEvent } from './TimelineEvent';

export default class IssueComment extends TimelineEvent implements Comment, Reactable {
  // from comment
  author?: string | Actor;
  author_association!: string;
  body!: string;
  created_at!: Date;
  created_via_email!: boolean;
  editor?: string | Actor;
  includes_created_edit!: boolean;
  last_edited_at?: Date;
  published_at?: Date;
  updated_at!: Date;

  // from reactables
  reaction_groups?: Record<string, number>;

  // local
  is_minimized!: boolean;
  minimized_reason?: string;

  public static get __schema(): Joi.ObjectSchema<IssueComment> {
    return super.__schema
      .append(Comment.__schema)
      .append(Reactable.__schema)
      .append<IssueComment>({
        is_minimized: Joi.boolean().required(),
        minimized_reason: Joi.string().required(),
      })
      .custom((value) => new IssueComment(value));
  }
}

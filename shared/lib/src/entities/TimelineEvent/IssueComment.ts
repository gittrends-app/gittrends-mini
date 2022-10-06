import Joi from 'joi';

import { Actor } from '../Actor';
import { Reaction } from '../Reaction';
import { TimelineEvent } from '../TimelineEvent';
import { Comment } from '../interfaces/Comment';
import { Reactable } from '../interfaces/Reactable';

export default class IssueComment extends TimelineEvent implements Comment, Reactable {
  author_association!: string;
  author?: string | Actor;
  body!: string;
  created_at!: Date;
  created_via_email!: boolean;
  editor?: string | Actor;
  includes_created_edit!: boolean;
  is_minimized!: boolean;
  last_edited_at?: Date;
  minimized_reason?: string;
  published_at?: Date;
  reaction_groups!: Record<string, number>;
  reactions!: number | Reaction[];
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<IssueComment> {
    return super.__schema
      .append<IssueComment>({
        author_association: Joi.string().required(),
        author: Joi.alternatives(Joi.string(), Actor.__schema),
        body: Joi.string().default(''),
        created_at: Joi.date().required(),
        created_via_email: Joi.boolean().required(),
        editor: Joi.alternatives(Joi.string(), Actor.__schema),
        includes_created_edit: Joi.boolean().required(),
        is_minimized: Joi.boolean().required(),
        last_edited_at: Joi.date(),
        minimized_reason: Joi.string(),
        published_at: Joi.date(),
        reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()).required(),
        reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)).required(),
        updated_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new IssueComment(), value));
  }
}

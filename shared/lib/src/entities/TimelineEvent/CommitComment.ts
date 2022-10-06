import Joi from 'joi';

import { Actor } from '../Actor';
import { Reaction } from '../Reaction';
import { TimelineEvent } from '../TimelineEvent';
import { Comment } from '../interfaces/Comment';
import { Reactable } from '../interfaces/Reactable';

export class CommitComment extends TimelineEvent implements Comment, Reactable {
  author_association!: string;
  author?: string | Actor | undefined;
  body!: string;
  commit?: string;
  created_at!: Date;
  created_via_email!: boolean;
  editor?: string | Actor | undefined;
  includes_created_edit!: boolean;
  last_edited_at?: Date | undefined;
  path?: string;
  position?: number;
  published_at?: Date | undefined;
  reaction_groups!: Record<string, number>;
  reactions!: number | Reaction[];
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<CommitComment> {
    return super.__schema
      .append<CommitComment>({
        author_association: Joi.string().required(),
        author: Joi.alternatives(Joi.string(), Actor.__schema),
        body: Joi.string().default(''),
        commit: Joi.string(),
        created_at: Joi.date().required(),
        created_via_email: Joi.boolean().required(),
        editor: Joi.alternatives(Joi.string(), Actor.__schema),
        includes_created_edit: Joi.boolean().required(),
        last_edited_at: Joi.date(),
        path: Joi.string(),
        position: Joi.number(),
        published_at: Joi.date(),
        updated_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new CommitComment(), value));
  }
}

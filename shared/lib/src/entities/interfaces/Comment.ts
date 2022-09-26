import { Actor } from '../Actor';

export interface Comment {
  author?: string | Actor;
  author_association: string;
  body?: string;
  created_at: Date;
  created_via_email: boolean;
  editor?: string | Actor;
  includes_created_edit: boolean;
  last_edited_at?: Date;
  published_at?: Date;
  updated_at: Date;
}

// export const CommentSchema = Joi.object<Comment>({
//   author: Joi.alternatives(Joi.string(), Actor.__schema),
//   author_association: Joi.string().required(),
//   body: Joi.string().required(),
//   created_at: Joi.date().required(),
//   created_via_email: Joi.boolean().required(),
//   editor: Joi.alternatives(Joi.string(), Actor.__schema),
//   includes_created_edit: Joi.boolean().required(),
//   last_edited_at: Joi.date(),
//   published_at: Joi.date(),
//   updated_at: Joi.date().required(),
// });

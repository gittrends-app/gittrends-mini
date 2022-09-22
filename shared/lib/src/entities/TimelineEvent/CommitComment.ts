import Joi from 'joi';

import { Comment } from './Comment';
import { Reactable } from './Reactable';

export class CommitComment extends Comment implements Reactable {
  commit?: string;
  path?: string;
  position?: number;
  reaction_groups?: Record<string, number>;

  public static get __schema(): Joi.ObjectSchema<CommitComment> {
    return super.__schema
      .append(Reactable.__schema)
      .append<CommitComment>({
        commit: Joi.string(),
        path: Joi.string(),
        position: Joi.number(),
      })
      .custom((value) => new CommitComment(value));
  }
}

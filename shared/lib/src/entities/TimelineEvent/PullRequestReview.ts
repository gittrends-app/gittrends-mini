import Joi from 'joi';

import { Actor } from '../Actor';
import { Reaction } from '../Reaction';
import { TimelineEvent } from '../TimelineEvent';
import { Comment } from '../interfaces/Comment';
import { Reactable } from '../interfaces/Reactable';
import { PullRequestReviewComment } from './PullRequestReviewComment';

export default class PullRequestReview extends TimelineEvent implements Comment, Reactable {
  author_association!: string;
  author_can_push_to_repository!: boolean;
  author?: string | Actor;
  body?: string;
  comments!: PullRequestReviewComment[];
  commit?: string;
  created_at!: Date;
  created_via_email!: boolean;
  editor?: string | Actor;
  includes_created_edit!: boolean;
  last_edited_at?: Date;
  published_at?: Date;
  reaction_groups!: Record<string, number>;
  reactions!: number | Reaction[];
  state!: string;
  submitted_at?: Date;
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<PullRequestReview> {
    return super.__schema
      .append<PullRequestReview>({
        author_association: Joi.string().required(),
        author_can_push_to_repository: Joi.boolean().required(),
        author: Joi.alternatives(Joi.string(), Actor.__schema),
        body: Joi.string().default(''),
        comments: Joi.array().items(PullRequestReviewComment.__schema).required(),
        commit: Joi.string(),
        created_at: Joi.date().required(),
        created_via_email: Joi.boolean().required(),
        editor: Joi.alternatives(Joi.string(), Actor.__schema),
        includes_created_edit: Joi.boolean().required(),
        last_edited_at: Joi.date(),
        published_at: Joi.date(),
        reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()).required(),
        reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)).required(),
        state: Joi.string().required(),
        submitted_at: Joi.date(),
        updated_at: Joi.date().required(),
      })
      .custom((value) => Object.assign(new PullRequestReview(), value));
  }
}

import Joi from 'joi';

import { Actor } from '../Actor';
import { Comment } from './Comment';
import { PullRequestReviewComment } from './PullRequestReviewComment';
import { Reactable } from './Reactable';
import { TimelineEvent } from './TimelineEvent';

export default class PullRequestReview extends TimelineEvent implements Comment, Reactable {
  // shared from comment
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

  // shared with reactions
  reaction_groups?: Record<string, number>;

  // own fields
  author_can_push_to_repository!: boolean;
  comments!: PullRequestReviewComment[];
  commit?: string;
  state!: string;
  submitted_at?: Date;

  public static get __schema(): Joi.ObjectSchema<PullRequestReview> {
    return super.__schema
      .append(Comment.__schema)
      .append(Reactable.__schema)
      .append<PullRequestReview>({
        author_can_push_to_repository: Joi.boolean().required(),
        comments: Joi.array().items(PullRequestReviewComment.__schema).required(),
        commit: Joi.string(),
        state: Joi.string().required(),
        submitted_at: Joi.date(),
      })
      .custom((value) => new PullRequestReview(value));
  }
}

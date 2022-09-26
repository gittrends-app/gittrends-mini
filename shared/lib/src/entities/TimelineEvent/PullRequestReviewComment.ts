import Joi from 'joi';

import { CommitComment } from './CommitComment';

export class PullRequestReviewComment extends CommitComment {
  diff_hunk!: string;
  drafted_at!: Date;
  is_minimized!: boolean;
  minimized_reason?: string;
  original_commit?: string;
  original_position!: number;
  outdated!: boolean;
  reply_to?: string;
  state!: string;

  public static get __schema(): Joi.ObjectSchema<PullRequestReviewComment> {
    return super.__schema
      .append<PullRequestReviewComment>({
        diff_hunk: Joi.string().required(),
        drafted_at: Joi.date().required(),
        is_minimized: Joi.boolean().required(),
        minimized_reason: Joi.string(),
        original_commit: Joi.string(),
        original_position: Joi.number().required(),
        outdated: Joi.boolean().required(),
        reply_to: Joi.string(),
        state: Joi.string().required(),
      })
      .custom((value) => Object.assign(new PullRequestReviewComment(), value));
  }
}

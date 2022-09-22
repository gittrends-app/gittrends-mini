import Joi from 'joi';

import { Actor } from '../Actor';
import { RepositoryResource } from '../Repository';
import { PullRequestReviewComment } from './PullRequestReviewComment';

export default class PullRequestReviewThread extends RepositoryResource {
  comments!: PullRequestReviewComment[];
  diff_side!: string;
  is_collapsed!: boolean;
  is_outdated!: boolean;
  is_resolved!: boolean;
  line?: number;
  original_line?: number;
  original_start_line?: number;
  path!: string;
  resolved_by?: string | Actor;
  start_diff_side?: string;
  start_line?: number;

  public static get __schema(): Joi.ObjectSchema<PullRequestReviewThread> {
    return super.__schema
      .append<PullRequestReviewThread>({
        comments: Joi.array().items(PullRequestReviewComment.__schema).required(),
        diff_side: Joi.string().required(),
        is_collapsed: Joi.boolean().required(),
        is_outdated: Joi.boolean().required(),
        is_resolved: Joi.boolean().required(),
        line: Joi.number(),
        original_line: Joi.number(),
        original_start_line: Joi.number(),
        path: Joi.string().required(),
        resolved_by: Joi.alternatives(Joi.string(), Actor.__schema),
        start_diff_side: Joi.string(),
        start_line: Joi.number(),
      })
      .custom((value) => new PullRequestReviewThread(value));
  }
}

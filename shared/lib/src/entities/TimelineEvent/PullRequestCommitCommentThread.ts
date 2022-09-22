import Joi from 'joi';

import { CommitComment } from './CommitComment';
import { TimelineEvent } from './TimelineEvent';

export default class PullRequestCommitCommentThread extends TimelineEvent {
  comments!: CommitComment[];
  commit!: string;
  path?: string;
  position?: number;

  public static get __schema(): Joi.ObjectSchema<PullRequestCommitCommentThread> {
    return super.__schema
      .append<PullRequestCommitCommentThread>({
        comments: Joi.array().items(CommitComment.__schema).required(),
        commit: Joi.string().required(),
        path: Joi.string(),
        position: Joi.number(),
      })
      .custom((value) => new PullRequestCommitCommentThread(value));
  }
}

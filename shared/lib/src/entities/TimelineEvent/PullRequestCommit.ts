import Joi from 'joi';

import { TimelineEvent } from './TimelineEvent';

export default class PullRequestCommit extends TimelineEvent {
  commit!: string;

  public static get __schema(): Joi.ObjectSchema<PullRequestCommit> {
    return super.__schema
      .append<PullRequestCommit>({
        commit: Joi.string().required(),
      })
      .custom((value) => new PullRequestCommit(value));
  }
}

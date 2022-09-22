import Joi from 'joi';

import { Actor } from '../Actor';
import { PullRequestCommit } from './PullRequestCommit';
import { PullRequestReview } from './PullRequestReview';
import { TimelineEvent } from './TimelineEvent';

export default class ReviewDismissedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  dismissal_message?: string;
  previous_review_state!: string;
  pull_request_commit?: string | PullRequestCommit;
  review?: string | PullRequestReview;

  public static get __schema(): Joi.ObjectSchema<ReviewDismissedEvent> {
    return super.__schema
      .append<ReviewDismissedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        dismissal_message: Joi.string(),
        previous_review_state: Joi.string().required(),
        pull_request_commit: Joi.alternatives(Joi.string(), PullRequestCommit.__schema),
        review: Joi.alternatives(Joi.string(), PullRequestReview.__schema),
      })
      .custom((value) => new ReviewDismissedEvent(value));
  }
}

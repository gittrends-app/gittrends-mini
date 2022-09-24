import Joi from 'joi';

import { TimelineEvent } from '../TimelineEvent';

export default class PullRequestRevisionMarker extends TimelineEvent {
  created_at!: Date;
  last_seen_commit!: string;

  public static get __schema(): Joi.ObjectSchema<PullRequestRevisionMarker> {
    return super.__schema
      .append<PullRequestRevisionMarker>({
        created_at: Joi.date().required(),
        last_seen_commit: Joi.string().required(),
      })
      .custom((value) => Object.assign(new PullRequestRevisionMarker(), value));
  }
}

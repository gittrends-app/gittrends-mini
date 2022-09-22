import Joi from 'joi';

import { RepositoryResource } from '../Repository';

export default class PullRequestRevisionMarker extends RepositoryResource {
  created_at!: Date;
  last_seen_commit!: string;

  public static get __schema(): Joi.ObjectSchema<PullRequestRevisionMarker> {
    return super.__schema
      .append<PullRequestRevisionMarker>({
        created_at: Joi.date().required(),
        last_seen_commit: Joi.string().required(),
      })
      .custom((value) => new PullRequestRevisionMarker(value));
  }
}

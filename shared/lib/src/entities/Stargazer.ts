/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import { RepositoryResource } from './Repository';

export class Stargazer extends RepositoryResource<{ user: string | User; starred_at: Date }> {
  user!: string | User;
  starred_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Stargazer> {
    return super.__schema.append<Stargazer>({
      user: Joi.alternatives(Joi.string(), User.__schema)
        .custom((value) => (typeof value === 'string' ? value : new User(value)))
        .required(),
      starred_at: Joi.date().required(),
    });
  }
}

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import { Entity } from './Entity';
import { Repository } from './Repository';

type TStargazer = {
  repository: string | Repository;
  user: string | User;
  starred_at: Date;
};

export class Stargazer extends Entity<TStargazer> {
  repository!: string | Repository;
  user!: string | User;
  starred_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Stargazer> {
    return Joi.object<Stargazer>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema)
        .custom((value) => (typeof value === 'string' ? value : new Repository(value)))
        .required(),
      user: Joi.alternatives(Joi.string(), User.__schema)
        .custom((value) => (typeof value === 'string' ? value : new User(value)))
        .required(),
      starred_at: Joi.date().required(),
    });
  }
}

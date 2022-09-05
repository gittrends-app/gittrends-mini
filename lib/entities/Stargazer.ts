/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import Entity from './Entity';

export default class Stargazer extends Entity {
  user!: string | User;
  starred_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Stargazer> {
    return Joi.object<Stargazer>({
      user: Joi.alternatives(Joi.string(), User.__schema)
        .custom((value) => new User(value))
        .required(),
      starred_at: Joi.date().required(),
    });
  }
}

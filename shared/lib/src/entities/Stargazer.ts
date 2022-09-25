/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import { Entity } from './Entity';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Stargazer extends Entity implements RepositoryResource {
  repository!: string;
  user!: string | User;
  starred_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Stargazer> {
    return Joi.object<Stargazer>({
      repository: Joi.string().required(),
      user: Joi.alternatives(Joi.string(), User.__schema).required(),
      starred_at: Joi.date().required(),
    }).custom((value) => Object.assign(new Stargazer(), value));
  }
}

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import { RepositoryResource } from './Repository';

export class Watcher extends RepositoryResource<{ user: string | User }> {
  user!: string | User;

  public static get __schema(): Joi.ObjectSchema<Watcher> {
    return super.__schema.append<Watcher>({
      user: Joi.alternatives(Joi.string(), User.__schema)
        .custom((value) => (typeof value === 'string' ? value : new User(value)))
        .required(),
    });
  }
}

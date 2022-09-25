/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { User } from './Actor';
import { Entity } from './Entity';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Watcher extends Entity<Watcher> implements RepositoryResource {
  repository!: string;
  user!: string | User;

  public static get __schema(): Joi.ObjectSchema<Watcher> {
    return Joi.object<Watcher>({
      repository: Joi.string().required(),
      user: Joi.alternatives(Joi.string(), User.__schema).required(),
    }).custom((value) => Object.assign(new Watcher(), value));
  }
}

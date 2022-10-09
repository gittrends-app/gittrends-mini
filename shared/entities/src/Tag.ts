/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor, User } from './Actor';
import { Entity } from './Entity';
import { Node } from './interfaces/Node';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Tag extends Entity<Tag> implements Node, RepositoryResource {
  id!: string;
  repository!: string;
  message?: string;
  name!: string;
  oid!: string;
  tagger!: { date: Date; email?: string; name: string; user?: string | Actor };
  target?: string;

  public static get __schema(): Joi.ObjectSchema<Tag> {
    return Joi.object<Tag>({
      id: Joi.string().required(),
      repository: Joi.string().required(),
      message: Joi.string(),
      name: Joi.string().required(),
      oid: Joi.string().required(),
      tagger: Joi.object({
        date: Joi.date().required(),
        email: Joi.string(),
        name: Joi.string().default('').required(),
        user: Joi.alternatives(Joi.string(), User.__schema),
      }),
      target: Joi.string(),
    }).custom((value) => Object.assign(new Tag(), value));
  }
}

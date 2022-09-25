/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor } from './Actor';
import { Entity } from './Entity';
import { Node } from './interfaces/Node';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Reaction extends Entity implements Node, RepositoryResource {
  id!: string;
  repository!: string;
  reactable!: string;
  content!: string;
  created_at!: Date;
  user?: string | Actor;

  public static get __schema(): Joi.ObjectSchema<Reaction> {
    return Joi.object<Reaction>({
      id: Joi.string().required(),
      repository: Joi.string().required(),
      reactable: Joi.string().required(),
      content: Joi.string().required(),
      created_at: Joi.date().required(),
      user: Joi.alternatives(Joi.string(), Actor.__schema),
    }).custom((value) => Object.assign(new Reaction(), value));
  }
}

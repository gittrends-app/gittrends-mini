/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor, User } from './Actor';
import { RepositoryResource } from './Repository';

type TTag = {
  id: string;
  message?: string;
  name: string;
  oid: string;
  tagger: { date: Date; email?: string; name: string; user?: string | Actor };
  target?: string;
};

export class Tag extends RepositoryResource<TTag> {
  id!: string;
  message?: string;
  name!: string;
  oid!: string;
  tagger!: { date: Date; email?: string; name: string; user?: string | Actor };
  target?: string;

  public static get __schema(): Joi.ObjectSchema<Tag> {
    return super.__schema.append<Tag>({
      id: Joi.string().required(),
      message: Joi.string(),
      name: Joi.string().required(),
      oid: Joi.string().required(),
      tagger: Joi.object({
        date: Joi.date().required(),
        email: Joi.string(),
        name: Joi.string().required(),
        user: Joi.alternatives(Joi.string(), User.__schema).custom((value) =>
          typeof value === 'string' ? value : new User(value),
        ),
      }),
      target: Joi.string(),
    });
  }
}

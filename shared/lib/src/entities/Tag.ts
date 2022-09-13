/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor, User } from './Actor';
import { Entity } from './Entity';
import { Repository } from './Repository';

type TTag = {
  repository: string | Repository;
  id: string;
  message: string;
  name: string;
  oid: string;
  tagger: { date: Date; email: string; name: string; user?: string | Actor };
  target: string;
};

export class Tag extends Entity<TTag> {
  repository!: string | Repository;
  id!: string;
  message!: string;
  name!: string;
  oid!: string;
  tagger!: { date: Date; email: string; user?: string | Actor };
  target!: string;

  public static get __schema(): Joi.ObjectSchema<Tag> {
    return Joi.object<Tag>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema)
        .custom((value) => (typeof value === 'string' ? value : new Repository(value)))
        .required(),
      id: Joi.string().required(),
      message: Joi.string().required(),
      name: Joi.string().required(),
      oid: Joi.string().required(),
      tagger: Joi.object({
        date: Joi.date().required(),
        email: Joi.string().required(),
        name: Joi.string().required(),
        user: Joi.alternatives(Joi.string(), User.__schema).custom((value) =>
          typeof value === 'string' ? value : new User(value),
        ),
      }),
      target: Joi.string().required(),
    });
  }
}

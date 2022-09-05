/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import Entity from './Entity';
import Repository from './Repository';

export default class Metadata extends Entity {
  // Protected fields
  static readonly __strip_unknown: boolean = false;
  static readonly __convert: boolean = true;

  // Entity fields
  repository!: string | Repository;
  resource!: 'repository' | 'stargazers';
  end_cursor?: string;
  updated_at?: Date;

  [key: string]: unknown;

  public static get __schema(): Joi.ObjectSchema<Metadata> {
    return Joi.object<Metadata>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema)
        .custom((value) => (typeof value === 'string' ? value : new Repository(value)))
        .required(),
      resource: Joi.string().valid('repository', 'stargazers').required(),
      end_cursor: Joi.string(),
      updated_at: Joi.date(),
    });
  }
}

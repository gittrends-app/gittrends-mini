/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Entity } from './Entity';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Metadata extends Entity<Metadata> implements RepositoryResource {
  // Protected fields
  static readonly __strip_unknown: boolean = false;
  static readonly __convert: boolean = true;

  // Entity fields
  repository!: string;
  resource!: string;
  resource_id?: string;
  end_cursor?: string;
  updated_at?: Date;
  finished_at?: Date;

  [key: string]: unknown;

  public static get __schema(): Joi.ObjectSchema<Metadata> {
    return Joi.object<Metadata>({
      repository: Joi.string().required(),
      resource: Joi.string().required(),
      end_cursor: Joi.string(),
      updated_at: Joi.date(),
      finished_at: Joi.date(),
    }).custom((value) => Object.assign(new Metadata(), value));
  }
}

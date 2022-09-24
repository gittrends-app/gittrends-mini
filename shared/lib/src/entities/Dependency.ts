/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Entity } from './Entity';
import { Repository } from './Repository';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Dependency extends Entity<Dependency> implements RepositoryResource {
  repository!: string | Repository;
  manifest!: string;
  package_name!: string;
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  target_repository?: { id: string; database_id: number; name_with_owner: string } | string;
  requirements?: string;

  public static get __schema(): Joi.ObjectSchema<Dependency> {
    return Joi.object<Dependency>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
      manifest: Joi.string().required(),
      package_name: Joi.string().required(),
      filename: Joi.string(),
      has_dependencies: Joi.boolean(),
      package_manager: Joi.string(),
      target_repository: Joi.alternatives(
        Joi.object({
          id: Joi.string().required(),
          database_id: Joi.number().required(),
          name_with_owner: Joi.string().required(),
        }),
        Joi.string(),
      ),
      requirements: Joi.string(),
    }).custom((value) => Object.assign(new Dependency(), value));
  }
}

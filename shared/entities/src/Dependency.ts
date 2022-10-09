/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Entity } from './Entity';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Dependency extends Entity<Dependency> implements RepositoryResource {
  repository!: string;
  manifest!: string;
  package_name!: string;
  filename!: string;
  blob_path!: string;
  has_dependencies!: boolean;
  package_manager?: string;
  target_repository?: { id: string; database_id: number; name_with_owner: string } | string;
  requirements!: string;

  public static get __schema(): Joi.ObjectSchema<Dependency> {
    return Joi.object<Dependency>({
      repository: Joi.string().required(),
      manifest: Joi.string().required(),
      package_name: Joi.string().required(),
      filename: Joi.string().required(),
      blob_path: Joi.string().required(),
      has_dependencies: Joi.boolean().required(),
      package_manager: Joi.string(),
      target_repository: Joi.alternatives(
        Joi.object({
          id: Joi.string().required(),
          database_id: Joi.number().required(),
          name_with_owner: Joi.string().required(),
        }),
        Joi.string(),
      ),
      requirements: Joi.string().default(''),
    }).custom((value) => Object.assign(new Dependency(), value));
  }
}

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { RepositoryResource } from './Repository';

type TDependency = {
  manifest: string;
  package_name: string;
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  target_repository?: { id: string; database_id: number; name_with_owner: string } | string;
  requirements?: string;
};

export class Dependency extends RepositoryResource<TDependency> {
  manifest!: string;
  package_name!: string;
  filename?: string;
  has_dependencies?: boolean;
  package_manager?: string;
  target_repository?: { id: string; database_id: number; name_with_owner: string } | string;
  requirements?: string;

  public static get __schema(): Joi.ObjectSchema<Dependency> {
    return super.__schema.append<Dependency>({
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
    });
  }
}

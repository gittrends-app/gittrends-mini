/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor, User } from './Actor';
import { Entity } from './Entity';
import { Repository } from './Repository';
import { Node } from './interfaces/Node';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Release extends Entity<Release> implements Node, RepositoryResource {
  id!: string;
  repository!: string | Repository;
  author!: string | Actor;
  created_at!: Date;
  description?: string;
  is_draft?: boolean;
  is_prerelease?: boolean;
  name?: string;
  published_at?: Date;
  release_assets?: number;
  tag!: string;
  tag_name!: string;
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Release> {
    return Joi.object<Release>({
      id: Joi.string().required(),
      repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
      author: Joi.alternatives(Joi.string(), User.__schema).required(),
      created_at: Joi.date().required(),
      description: Joi.string(),
      is_draft: Joi.boolean().default(false),
      is_prerelease: Joi.boolean().default(false),
      name: Joi.string(),
      published_at: Joi.date().required(),
      release_assets: Joi.number(),
      tag: Joi.string().required(),
      tag_name: Joi.string().required(),
      updated_at: Joi.date().required(),
    }).custom((value) => Object.assign(new Release(), value));
  }
}

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Actor, User } from './Actor';
import { Entity } from './Entity';
import { Reaction } from './Reaction';
import { Node } from './interfaces/Node';
import { Reactable } from './interfaces/Reactable';
import { RepositoryResource } from './interfaces/RepositoryResource';

export class Release extends Entity<Release> implements Node, RepositoryResource, Reactable {
  id!: string;
  repository!: string;
  author?: string | Actor;
  created_at!: Date;
  description?: string;
  is_draft!: boolean;
  is_prerelease!: boolean;
  mentions!: number;
  name?: string;
  published_at?: Date;
  reaction_groups!: Record<string, number>;
  reactions!: number | Reaction[];
  release_assets!: number;
  tag?: string;
  tag_commit?: string;
  tag_name!: string;
  updated_at!: Date;

  public static get __schema(): Joi.ObjectSchema<Release> {
    return Joi.object<Release>({
      id: Joi.string().required(),
      repository: Joi.string().required(),
      author: Joi.alternatives(Joi.string(), User.__schema),
      created_at: Joi.date().required(),
      description: Joi.string(),
      is_draft: Joi.boolean().required(),
      is_prerelease: Joi.boolean().required(),
      mentions: Joi.number().required(),
      name: Joi.string(),
      published_at: Joi.date(),
      reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()).required(),
      reactions: Joi.alternatives(Joi.number(), Joi.array().items(Reaction.__schema)).required(),
      release_assets: Joi.number().required(),
      tag: Joi.string(),
      tag_commit: Joi.string(),
      tag_name: Joi.string().required(),
      updated_at: Joi.date().required(),
    }).custom((value) => Object.assign(new Release(), value));
  }
}

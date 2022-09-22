/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Dependency } from './Dependency';
import { Entity } from './Entity';
import { Issue } from './Issue';
import { Release } from './Release';
import { Repository } from './Repository';
import { Stargazer } from './Stargazer';
import { Tag } from './Tag';
import { Watcher } from './Watcher';

type TMetadata = {
  repository: string | Repository;
  resource?: string;
  resource_id?: string;
  end_cursor?: string;
  updated_at: Date;
} & Record<string, unknown>;

export class Metadata extends Entity<TMetadata> {
  // Protected fields
  static readonly __strip_unknown: boolean = false;
  static readonly __convert: boolean = true;

  // Entity fields
  repository!: string | Repository;
  resource!: string;
  resource_id?: string;
  end_cursor?: string;
  updated_at?: Date;

  [key: string]: unknown;

  public static get __schema(): Joi.ObjectSchema<Metadata> {
    return Joi.object<Metadata>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
      resource: Joi.string().valid(
        ...[Repository, Stargazer, Tag, Release, Watcher, Dependency, Issue].map((t) => t.__collection_name),
      ),
      end_cursor: Joi.string(),
      updated_at: Joi.date(),
    }).custom((value) => new Metadata(value));
  }
}

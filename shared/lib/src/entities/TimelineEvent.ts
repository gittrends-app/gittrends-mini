/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { extname } from 'path';

import { Entity } from './Entity';
import { Node } from './interfaces/Node';
import { RepositoryResource } from './interfaces/RepositoryResource';

export abstract class TimelineEvent extends Entity<TimelineEvent> implements Node, RepositoryResource {
  id!: string;
  repository!: string;
  issue!: string;
  type!: string;

  public static get __schema(): Joi.ObjectSchema<TimelineEvent> {
    return Joi.object<TimelineEvent>({
      id: Joi.string().required(),
      repository: Joi.string().required(),
      issue: Joi.string().required(),
      type: Joi.string().required(),
    });
  }

  public static from(data: any): TimelineEvent {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: TimelineEventClass } = require(`./TimelineEvent/${data.type}${extname(__filename)}`);
    return new TimelineEventClass(data);
  }
}

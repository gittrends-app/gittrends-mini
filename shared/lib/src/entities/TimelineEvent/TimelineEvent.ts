/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { extname } from 'path';

import { RepositoryResource } from '../Repository';

export abstract class TimelineEvent extends RepositoryResource {
  id!: string;
  issue!: string;
  type!: string;

  public static get __schema(): Joi.ObjectSchema<TimelineEvent> {
    return super.__schema.append<TimelineEvent>({
      id: Joi.string().required(),
      issue: Joi.string().required(),
      type: Joi.string().required(),
    });
  }

  public static async from(data: any) {
    const Class = await import(`${data.type}${extname(__filename)}`);
    return new Class(data);
  }
}

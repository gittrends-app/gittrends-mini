import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class RemovedFromProjectEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  project?: string;
  project_column_name!: string;

  public static get __schema(): Joi.ObjectSchema<RemovedFromProjectEvent> {
    return super.__schema
      .append<RemovedFromProjectEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        project: Joi.string(),
        project_column_name: Joi.string().required(),
      })
      .custom((value) => new RemovedFromProjectEvent(value));
  }
}

import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class AddedToProjectEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  project?: string;
  project_card?: string;
  project_column_name!: string;

  public static get __schema(): Joi.ObjectSchema<AddedToProjectEvent> {
    return super.__schema
      .append<AddedToProjectEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        project: Joi.string(),
        project_card: Joi.string(),
        project_column_name: Joi.string().required(),
      })
      .custom((value) => new AddedToProjectEvent(value));
  }
}

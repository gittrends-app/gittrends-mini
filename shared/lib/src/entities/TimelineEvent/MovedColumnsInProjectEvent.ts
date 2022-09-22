import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class MovedColumnsInProjectEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  previous_project_column_name!: string;
  project?: string;
  project_card?: string;
  project_column_name!: string;

  public static get __schema(): Joi.ObjectSchema<MovedColumnsInProjectEvent> {
    return super.__schema
      .append<MovedColumnsInProjectEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema),
        created_at: Joi.date().required(),
        previous_project_column_name: Joi.string().required(),
        project: Joi.string(),
        project_card: Joi.string(),
        project_column_name: Joi.string().required(),
      })
      .custom((value) => new MovedColumnsInProjectEvent(value));
  }
}

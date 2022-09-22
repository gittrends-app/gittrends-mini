import Joi from 'joi';

import { Actor } from '../Actor';
import { TimelineEvent } from './TimelineEvent';

export default class DeploymentEnvironmentChangedEvent extends TimelineEvent {
  actor?: string | Actor;
  created_at!: Date;
  deployment_status!: string;

  public static get __schema(): Joi.ObjectSchema<DeploymentEnvironmentChangedEvent> {
    return super.__schema
      .append<DeploymentEnvironmentChangedEvent>({
        actor: Joi.alternatives(Joi.string(), Actor.__schema).required(),
        created_at: Joi.date().required(),
        deployment_status: Joi.string().required(),
      })
      .custom((value) => new DeploymentEnvironmentChangedEvent(value));
  }
}

import Joi from 'joi';

import { Entity } from '../Entity';

export class Reactable extends Entity {
  reaction_groups?: Record<string, number>;

  public static get __schema(): Joi.ObjectSchema<Reactable> {
    return Joi.object<Reactable>({
      reaction_groups: Joi.object().pattern(Joi.string(), Joi.number()),
    }).custom((value) => new Reactable(value));
  }
}

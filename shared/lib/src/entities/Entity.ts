/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { cloneDeep, omit } from 'lodash';

export class EntityValidationError extends Error {
  public readonly errors!: string[];

  constructor(errors: string[], source?: any) {
    super(`Entity validation error.\n${JSON.stringify(errors)}\n${JSON.stringify(source)}`);
    this.errors = errors;
  }
}

export abstract class Entity {
  static readonly __strip_unknown: boolean = true;
  static readonly __convert: boolean = true;

  constructor(object?: Record<any, unknown>) {
    if (object) Object.assign(this, (this.constructor as unknown as typeof Entity).transform(object));
  }

  public toJSON(): Record<any, unknown> {
    return omit(cloneDeep(this), ['toJSON']);
  }

  public static get __schema(): Joi.ObjectSchema<Entity> {
    throw new Error('Subclasses of Entity must implement __schema()!');
  }

  public static transform(object: Record<string, unknown>): Entity {
    const { error, value } = this.__schema.validate(object, {
      convert: this.__convert,
      abortEarly: false,
      stripUnknown: this.__strip_unknown,
      allowUnknown: !this.__strip_unknown,
    });

    if (error)
      throw new EntityValidationError(
        error.details.map((e) => e.message),
        object,
      );
    if (!value) throw new EntityValidationError([`Unknown error when parsing ${JSON.stringify(object)}`]);

    return value;
  }
}

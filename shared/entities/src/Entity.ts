/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { cloneDeep, omit, snakeCase } from 'lodash';
import { BaseError } from 'make-error-cause';
import { plural } from 'pluralize';

function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}

export abstract class Entity<T = any> {
  static readonly __schema: Joi.ObjectSchema<Entity>;
  static readonly __strip_unknown: boolean = true;
  static readonly __convert: boolean = true;

  static get __name() {
    return plural(snakeCase(this.name).toLowerCase());
  }

  constructor(object?: Omit<T, 'toJSON'> & Record<string, unknown>) {
    if (object) Object.assign(this, (this.constructor as unknown as typeof Entity).validate(object));
  }

  @enumerable(false)
  public toJSON(): Record<any, unknown> {
    return omit(cloneDeep(this), ['toJSON']);
  }

  public static validate<T extends Entity>(object: Record<string, unknown>): Omit<T, 'toJSON'> {
    const { error, value } = this.__schema.validate(object, {
      convert: this.__convert,
      abortEarly: false,
      stripUnknown: this.__strip_unknown,
      allowUnknown: !this.__strip_unknown,
    });

    if (error) {
      error.message = `${error.message} <${JSON.stringify({ original: error._original })}>`;
      throw new EntityValidationError(error);
    }

    return value as any;
  }
}

export class EntityValidationError extends BaseError {
  constructor(error: Joi.ValidationError) {
    super(error.message, error);
    this.name = this.constructor.name;
  }
}

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { cloneDeep, mapValues, omit, snakeCase } from 'lodash';
import { plural } from 'pluralize';

export class EntityValidationError extends Error {
  public readonly errors!: string[];

  constructor(errors: string[], source?: any) {
    super(`Entity validation error.\n${JSON.stringify(errors)}\n${JSON.stringify(source)}`);
    this.errors = errors;
  }
}

export abstract class Entity<T = any> {
  static readonly __strip_unknown: boolean = true;
  static readonly __convert: boolean = true;

  static get __collection_name() {
    return plural(snakeCase(this.name).toLowerCase());
  }

  constructor(object?: T & Record<string, unknown>) {
    if (object) Object.assign(this, (this.constructor as unknown as typeof Entity).transform(object));
  }

  public toJSON(schema?: 'sqlite'): Record<any, unknown> {
    return mapValues(omit(cloneDeep(this), ['toJSON']), (value) =>
      schema === 'sqlite' && typeof value === 'boolean' ? value.toString().toUpperCase() : value,
    );
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

/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';
import { cloneDeep, mapValues, omit, snakeCase } from 'lodash';
import { plural } from 'pluralize';

export abstract class Entity<T = any> {
  static readonly __schema: Joi.ObjectSchema<Entity>;
  static readonly __strip_unknown: boolean = true;
  static readonly __convert: boolean = true;

  static get __collection_name() {
    return plural(snakeCase(this.name).toLowerCase());
  }

  constructor(object?: Omit<T, 'toJSON'> & Record<string, unknown>) {
    if (object) Object.assign(this, (this.constructor as unknown as typeof Entity).validate(object));
  }

  public toJSON(schema?: 'sqlite'): Record<any, unknown> {
    return mapValues(omit(cloneDeep(this), ['toJSON']), (value) =>
      schema === 'sqlite' && typeof value === 'boolean' ? value.toString().toUpperCase() : value,
    );
  }

  public static validate<T extends Entity>(object: Record<string, unknown>): Omit<T, 'toJSON'> {
    const { error, value } = this.__schema.validate(object, {
      convert: this.__convert,
      abortEarly: false,
      stripUnknown: this.__strip_unknown,
      allowUnknown: !this.__strip_unknown,
    });

    if (error) throw error;
    else return value as any;
  }
}

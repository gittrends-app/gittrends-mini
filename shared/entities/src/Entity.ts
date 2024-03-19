/*
 *  Author: Hudson S. Borges
 */
import { cloneDeep } from 'lodash';
import { BaseError } from 'make-error-cause';
import { extname } from 'path';
import { ZodError, ZodType } from 'zod';

import {
  BotSchema,
  EnterpriseUserAccountSchema,
  MannequinSchema,
  OrganizationSchema,
  UserSchema,
} from './validators/Actor';
import { DependencySchema } from './validators/Dependency';
import { IssueSchema } from './validators/Issue';
import { PullRequestSchema } from './validators/PullRequest';
import { ReactionSchema } from './validators/Reaction';
import { ReleaseSchema } from './validators/Release';
import { RepositorySchema } from './validators/Repository';
import { StargazerSchema } from './validators/Stargazer';
import { TagSchema } from './validators/Tag';
import { TimelineEventSchema } from './validators/TimelineEvent';
import { WatcherSchema } from './validators/Watcher';

function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    if (descriptor) descriptor.enumerable = value;
    return descriptor;
  };
}

export class Entity<T extends { type: string }> {
  public readonly data: T;

  constructor(object: T & { [k: string]: unknown }) {
    this.data = Entity.validate<T>(object);
  }

  @enumerable(false)
  public toJSON(): T {
    return cloneDeep(this.data);
  }

  public static getSchemaValidator(type: string): ZodType | undefined {
    let validator: ZodType | undefined = undefined;

    if (type === 'User') validator = UserSchema;
    else if (type === 'Organization') validator = OrganizationSchema;
    else if (type === 'Mannequin') validator = MannequinSchema;
    else if (type === 'Bot') validator = BotSchema;
    else if (type === 'EnterpriseUserAccount') validator = EnterpriseUserAccountSchema;
    else if (type === 'Repository') validator = RepositorySchema;
    else if (type === 'Stargazer') validator = StargazerSchema;
    else if (type === 'Watcher') validator = WatcherSchema;
    else if (type === 'Tag') validator = TagSchema;
    else if (type === 'Reaction') validator = ReactionSchema;
    else if (type === 'Release') validator = ReleaseSchema;
    else if (type === 'Dependency') validator = DependencySchema;
    else if (type === 'TimelineEvent') validator = TimelineEventSchema;
    else if (type === 'Issue') validator = IssueSchema;
    else if (type === 'PullRequest') validator = PullRequestSchema;
    else {
      try {
        //eslint-disable-next-line @typescript-eslint/no-var-requires
        const Content = require(`./validators/TimelineEvent/${type}${extname(__filename)}`);
        if (Content && Content[type + 'Schema']) validator = Content[type + 'Schema'] as any;
      } catch (e) {
        // ignore
      }
    }

    return validator;
  }

  public static validate<T>(object: { type: string; [k: string]: unknown }): T {
    const validator = Entity.getSchemaValidator(object.type);

    if (!validator) throw new EntityTypeError(`Unknown entity type "${object.type}"`);

    const result = validator.safeParse(object);

    if (result.success === false) {
      throw new EntityValidationError(result.error);
    }

    return result.data as T;
  }
}

export class EntityValidationError extends BaseError {
  constructor(error: ZodError) {
    super(error.message, error);
    this.name = this.constructor.name;
  }
}

export class EntityTypeError extends BaseError {
  constructor(error: string) {
    super(error);
    this.name = this.constructor.name;
  }
}

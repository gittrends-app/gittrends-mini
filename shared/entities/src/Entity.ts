/*
 *  Author: Hudson S. Borges
 */
import { BaseError } from 'make-error-cause';
import { extname } from 'path';
import { ZodError, ZodType } from 'zod';

import { Metadata, MetadataSchema } from './Metadata';
import {
  Actor,
  BotSchema,
  EnterpriseUserAccountSchema,
  MannequinSchema,
  OrganizationSchema,
  UserSchema,
} from './validators/Actor';
import { Dependency, DependencySchema } from './validators/Dependency';
import { Issue, IssueSchema } from './validators/Issue';
import { PullRequest, PullRequestSchema } from './validators/PullRequest';
import { Reaction, ReactionSchema } from './validators/Reaction';
import { Release, ReleaseSchema } from './validators/Release';
import { Repository, RepositorySchema } from './validators/Repository';
import { Stargazer, StargazerSchema } from './validators/Stargazer';
import { Tag, TagSchema } from './validators/Tag';
import { TimelineEvent, TimelineEventSchema } from './validators/TimelineEvent';
import { Watcher, WatcherSchema } from './validators/Watcher';

export class Entity {
  protected constructor() {}

  public static getSchema(type: string): ZodType | undefined {
    let validator: ZodType | undefined = undefined;

    if (type === 'Metadata') validator = MetadataSchema;
    else if (type === 'User') validator = UserSchema;
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

  protected static validate<T>(object: { type: string; [k: string]: unknown }): T {
    const validator = Entity.getSchema(object.type);

    if (!validator) throw new EntityTypeError(`Unknown entity type "${object.type}"`);

    const result = validator.safeParse(object);

    if (result.success === false) {
      throw new EntityValidationError(result.error, object);
    }

    return result.data as T;
  }

  static actor = (object: Record<string, any>) => this.validate<Actor>({ type: 'Actor', ...object });
  static repository = (object: Record<string, any>) => this.validate<Repository>({ type: 'Repository', ...object });
  static stargazer = (object: Record<string, any>) => this.validate<Stargazer>({ type: 'Stargazer', ...object });
  static watcher = (object: Record<string, any>) => this.validate<Watcher>({ type: 'Watcher', ...object });
  static tag = (object: Record<string, any>) => this.validate<Tag>({ type: 'Tag', ...object });
  static reaction = (object: Record<string, any>) => this.validate<Reaction>({ type: 'Reaction', ...object });
  static release = (object: Record<string, any>) => this.validate<Release>({ type: 'Release', ...object });
  static dependency = (object: Record<string, any>) => this.validate<Dependency>({ type: 'Dependency', ...object });
  static timeline_event = (object: Record<string, any>) =>
    this.validate<TimelineEvent>({ type: object.type, ...object });
  static issue = (object: Record<string, any>) => this.validate<Issue>({ type: 'Issue', ...object });
  static pull_request = (object: Record<string, any>) => this.validate<PullRequest>({ type: 'PullRequest', ...object });
  static metadata = (object: Record<string, any>) => this.validate<Metadata>({ type: 'Metadata', ...object });
}

export class EntityValidationError extends BaseError {
  constructor(error: ZodError, object: Record<string, any>) {
    super(`Object: ${JSON.stringify(object)} - Error: ${error.message}`, error);
    this.name = this.constructor.name;
  }
}

export class EntityTypeError extends BaseError {
  constructor(error: string) {
    super(error);
    this.name = this.constructor.name;
  }
}

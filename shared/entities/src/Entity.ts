/*
 *  Author: Hudson S. Borges
 */
import { BaseError } from 'make-error-cause';
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
import * as TE from './validators/TimelineEvent/index';
import { Watcher, WatcherSchema } from './validators/Watcher';

const SchemaMap: Record<string, ZodType> = {
  // Actors schemas
  User: UserSchema,
  Organization: OrganizationSchema,
  Mannequin: MannequinSchema,
  Bot: BotSchema,
  EnterpriseUserAccount: EnterpriseUserAccountSchema,
  // Other schemas
  Metadata: MetadataSchema,
  Repository: RepositorySchema,
  Stargazer: StargazerSchema,
  Watcher: WatcherSchema,
  Tag: TagSchema,
  Reaction: ReactionSchema,
  Release: ReleaseSchema,
  Dependency: DependencySchema,
  TimelineEvent: TimelineEventSchema,
  Issue: IssueSchema,
  PullRequest: PullRequestSchema,
  // Timeline Events
  ...Object.entries(TE).reduce(
    (acc, [key, value]) => ({ ...acc, [key.endsWith('Schema') ? key.slice(0, -6) : key]: value }),
    {},
  ),
};

export class Entity {
  protected constructor() {}

  public static getSchema(type: string): ZodType | undefined {
    return SchemaMap[type];
  }

  protected static validate<T>(object: { [k: string]: unknown }, type: string): T {
    const validator = Entity.getSchema(type);

    if (!validator) throw new EntityTypeError(`Unknown entity type "${type}"`);

    const result = validator.safeParse(object);

    if (result.success === false) {
      throw new EntityValidationError(result.error, object);
    }

    return result.data as T;
  }

  static actor = (object: Record<string, any>) => this.validate<Actor>(object, object.__type);
  static repository = (object: Record<string, any>) => this.validate<Repository>(object, 'Repository');
  static stargazer = (object: Record<string, any>) => this.validate<Stargazer>(object, 'Stargazer');
  static watcher = (object: Record<string, any>) => this.validate<Watcher>(object, 'Watcher');
  static tag = (object: Record<string, any>) => this.validate<Tag>(object, 'Tag');
  static reaction = (object: Record<string, any>) => this.validate<Reaction>(object, 'Reaction');
  static release = (object: Record<string, any>) => this.validate<Release>(object, 'Release');
  static dependency = (object: Record<string, any>) => this.validate<Dependency>(object, 'Dependency');
  static timeline_event = (object: Record<string, any>) => this.validate<TimelineEvent>(object, object.__type);
  static issue = (object: Record<string, any>) => this.validate<Issue>(object, 'Issue');
  static pull_request = (object: Record<string, any>) => this.validate<PullRequest>(object, 'PullRequest');
  static metadata = (object: Record<string, any>) => this.validate<Metadata>(object, 'Metadata');
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

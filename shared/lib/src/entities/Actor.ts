/*
 *  Author: Hudson S. Borges
 */
import Joi from 'joi';

import { Entity } from './Entity';
import { Node } from './interfaces/Node';

export abstract class Actor extends Entity<Actor | any> implements Node {
  id!: string;
  type!: 'User' | 'Organization' | 'Mannequin' | 'Bot' | 'EnterpriseUserAccount';
  login!: string;
  avatar_url?: string;

  static readonly __schema = Joi.object<Actor>({
    id: Joi.string().required(),
    type: Joi.string().valid('User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount').required(),
    login: Joi.string().required(),
    avatar_url: Joi.string(),
  }).custom((value) => {
    switch (value.type) {
      case 'User':
        return Object.assign(new User(), value);
      case 'Organization':
        return Object.assign(new Organization(), value);
      case 'Mannequin':
        return Object.assign(new Mannequin(), value);
      case 'Bot':
        return Object.assign(new Bot(), value);
      case 'EnterpriseUserAccount':
        return Object.assign(new EnterpriseUserAccount(), value);
      default:
        return value;
    }
  });

  public static from(object: Record<string, unknown>): Actor {
    switch (object.type) {
      case 'User':
        return new User(object);
      case 'Organization':
        return new Organization(object);
      case 'Mannequin':
        return new Mannequin(object);
      case 'Bot':
        return new Bot(object);
      case 'EnterpriseUserAccount':
        return new EnterpriseUserAccount(object);
      default:
        throw new Error('Unknown actor type: ' + object.type);
    }
  }
}

export class User extends Actor {
  bio?: string;
  company?: string;
  created_at?: Date;
  database_id?: number;
  email?: string;
  followers?: number;
  following?: number;
  gists?: number;
  is_bounty_hunter?: boolean;
  is_campus_expert?: boolean;
  is_developer_program_member?: boolean;
  is_employee?: boolean;
  is_hireable?: boolean;
  is_site_admin?: boolean;
  location?: string;
  name?: string;
  projects?: number;
  projects_url?: string;
  repositories?: number;
  repositories_contributed_to?: number;
  starred_repositories?: number;
  status?: {
    created_at: Date;
    emoji?: string;
    expires_at?: Date;
    indicates_limited_availability?: boolean;
    message?: string;
    updated_at?: Date;
  };
  twitter_username?: string;
  updated_at?: Date;
  watching?: number;
  website_url?: string;

  public static get __schema(): Joi.ObjectSchema<User> {
    return super.__schema
      .append<User>({
        bio: Joi.string(),
        company: Joi.string(),
        created_at: Joi.date(),
        database_id: Joi.number(),
        email: Joi.string(),
        followers: Joi.number(),
        following: Joi.number(),
        gists: Joi.number(),
        is_bounty_hunter: Joi.boolean(),
        is_campus_expert: Joi.boolean(),
        is_developer_program_member: Joi.boolean(),
        is_employee: Joi.boolean(),
        is_hireable: Joi.boolean(),
        is_site_admin: Joi.boolean(),
        location: Joi.string(),
        name: Joi.string(),
        projects: Joi.number(),
        projects_url: Joi.string(),
        repositories: Joi.number(),
        repositories_contributed_to: Joi.number(),
        starred_repositories: Joi.number(),
        status: Joi.object({
          created_at: Joi.date().required(),
          emoji: Joi.string(),
          expires_at: Joi.date(),
          indicates_limited_availability: Joi.boolean(),
          message: Joi.string(),
          updated_at: Joi.date(),
        }),
        twitter_username: Joi.string(),
        updated_at: Joi.date(),
        watching: Joi.number(),
        website_url: Joi.string(),
      })
      .custom((value) => Object.assign(new User(), value));
  }
}

export class Organization extends Actor {
  created_at?: Date;
  database_id?: number;
  description?: string;
  email?: string;
  is_verified?: boolean;
  location?: string;
  members_with_role?: number;
  name?: string;
  repositories?: number;
  teams?: number;
  twitter_username?: string;
  updated_at?: Date;
  website_url?: string;

  public static get __schema(): Joi.ObjectSchema<Organization> {
    return super.__schema
      .append<Organization>({
        created_at: Joi.date(),
        database_id: Joi.number(),
        description: Joi.string(),
        email: Joi.string(),
        is_verified: Joi.boolean(),
        location: Joi.string(),
        members_with_role: Joi.number(),
        name: Joi.string(),
        repositories: Joi.number(),
        teams: Joi.number(),
        twitter_username: Joi.string(),
        updated_at: Joi.date(),
        website_url: Joi.string(),
      })
      .custom((value) => Object.assign(new Organization(), value));
  }
}

export class Mannequin extends Actor {
  created_at?: Date;
  database_id?: number;
  email?: string;
  updated_at?: Date;

  public static get __schema(): Joi.ObjectSchema<Mannequin> {
    return super.__schema
      .append<Mannequin>({
        created_at: Joi.date(),
        database_id: Joi.number(),
        email: Joi.string(),
        updated_at: Joi.date(),
      })
      .custom((value) => Object.assign(new Mannequin(), value));
  }
}

export class Bot extends Actor {
  created_at?: Date;
  database_id?: number;
  updated_at?: Date;

  public static get __schema(): Joi.ObjectSchema<Bot> {
    return super.__schema
      .append<Bot>({
        created_at: Joi.date(),
        database_id: Joi.number(),
        updated_at: Joi.date(),
      })
      .custom((value) => Object.assign(new Bot(), value));
  }
}

export class EnterpriseUserAccount extends Actor {
  created_at?: Date;
  name?: string;
  updated_at?: Date;
  user?: string;

  public static get __schema(): Joi.ObjectSchema<EnterpriseUserAccount> {
    return super.__schema
      .append<EnterpriseUserAccount>({
        created_at: Joi.date(),
        name: Joi.string(),
        updated_at: Joi.date(),
        user: Joi.string(),
      })
      .custom((value) => Object.assign(new EnterpriseUserAccount(), value));
  }
}

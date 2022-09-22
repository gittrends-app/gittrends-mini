/* *  Author: Hudson S. Borges */
import Joi from 'joi';

import { Actor } from './Actor';
import { Entity } from './Entity';

export class Repository extends Entity {
  id!: string;
  assignable_users?: number;
  code_of_conduct?: string;
  created_at?: Date;
  database_id?: number;
  default_branch?: string;
  delete_branch_on_merge?: boolean;
  description?: string;
  disk_usage?: number;
  forks?: number;
  funding_links?: Array<{ url: string; platform?: string }>;
  has_issues_enabled?: boolean;
  has_projects_enabled?: boolean;
  has_wiki_enabled?: boolean;
  homepage_url?: string;
  is_archived?: boolean;
  is_blank_issues_enabled?: boolean;
  is_disabled?: boolean;
  is_empty?: boolean;
  is_fork?: boolean;
  is_in_organization?: boolean;
  is_locked?: boolean;
  is_mirror?: boolean;
  is_private?: boolean;
  is_security_policy_enabled?: boolean;
  is_template?: boolean;
  is_user_configuration_repository?: boolean;
  issues?: number;
  labels?: number;
  languages?: Array<{ language: string; size: number }>;
  license_info?: string;
  lock_reason?: string;
  mentionable_users?: number;
  merge_commit_allowed?: boolean;
  milestones?: number;
  mirror_url?: string;
  name?: string;
  name_with_owner!: string;
  open_graph_image_url?: string;
  owner!: string | Actor;
  parent?: string;
  primary_language?: string;
  pushed_at?: Date;
  pull_requests?: number;
  rebase_merge_allowed?: boolean;
  releases?: number;
  repository_topics?: Array<string>;
  squash_merge_allowed?: boolean;
  stargazers?: number;
  tags?: number;
  template_repository?: string;
  updated_at?: Date;
  url?: string;
  uses_custom_open_graph_image?: boolean;
  vulnerability_alerts?: number;
  watchers?: number;

  public static get __schema(): Joi.ObjectSchema<Repository> {
    return Joi.object<Repository>({
      id: Joi.string().required(),
      assignable_users: Joi.number(),
      code_of_conduct: Joi.string(),
      created_at: Joi.date(),
      database_id: Joi.number(),
      default_branch: Joi.string(),
      delete_branch_on_merge: Joi.boolean(),
      description: Joi.string(),
      disk_usage: Joi.number(),
      forks: Joi.number(),
      funding_links: Joi.array().items(
        Joi.object({
          url: Joi.string().required(),
          platform: Joi.string(),
        }),
      ),
      has_issues_enabled: Joi.boolean(),
      has_projects_enabled: Joi.boolean(),
      has_wiki_enabled: Joi.boolean(),
      homepage_url: Joi.string(),
      is_archived: Joi.boolean(),
      is_blank_issues_enabled: Joi.boolean(),
      is_disabled: Joi.boolean(),
      is_empty: Joi.boolean(),
      is_fork: Joi.boolean(),
      is_in_organization: Joi.boolean(),
      is_locked: Joi.boolean(),
      is_mirror: Joi.boolean(),
      is_private: Joi.boolean(),
      is_security_policy_enabled: Joi.boolean(),
      is_template: Joi.boolean(),
      is_user_configuration_repository: Joi.boolean(),
      issues: Joi.number(),
      labels: Joi.number(),
      languages: Joi.array().items(
        Joi.object({
          language: Joi.string().required(),
          size: Joi.number().required(),
        }),
      ),
      license_info: Joi.string(),
      lock_reason: Joi.string(),
      mentionable_users: Joi.number(),
      merge_commit_allowed: Joi.boolean(),
      milestones: Joi.number(),
      mirror_url: Joi.string(),
      name: Joi.string(),
      name_with_owner: Joi.string().required(),
      open_graph_image_url: Joi.string(),
      owner: Joi.alternatives(Joi.string(), Actor.__schema).required(),
      parent: Joi.string(),
      primary_language: Joi.string(),
      pushed_at: Joi.date(),
      pull_requests: Joi.number(),
      rebase_merge_allowed: Joi.boolean(),
      releases: Joi.number(),
      repository_topics: Joi.array().items(Joi.string()),
      squash_merge_allowed: Joi.boolean(),
      stargazers: Joi.number(),
      tags: Joi.number(),
      template_repository: Joi.string(),
      updated_at: Joi.date(),
      url: Joi.string(),
      uses_custom_open_graph_image: Joi.boolean(),
      vulnerability_alerts: Joi.number(),
      watchers: Joi.number(),
    }).custom((value) => new Repository(value));
  }
}

export abstract class RepositoryResource<T = any> extends Entity<{ repository: string | Repository } & T> {
  repository!: string | Repository;

  public static get __schema(): Joi.ObjectSchema<RepositoryResource> {
    return Joi.object<RepositoryResource>({
      repository: Joi.alternatives(Joi.string(), Repository.__schema).required(),
    });
  }
}

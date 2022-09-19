import { mkdir } from 'fs/promises';
import { knex } from 'knex';
import { homedir } from 'os';
import path from 'path';

import { Actor, Dependency, Metadata, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/lib';

export async function createOrConnectDatabase(name: string | 'repositories') {
  const databaseFile = path.resolve(homedir(), '.gittrends', ...name.split('/')) + '.sqlite';

  await mkdir(path.dirname(databaseFile), { recursive: true });

  const knexInstance = knex({
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: { filename: databaseFile },
  });

  await knexInstance.raw('PRAGMA busy_timeout=30000;');

  await knexInstance.transaction((trx) =>
    Promise.all([
      trx.schema.hasTable(Actor.__collection_name).then((hasTable) => {
        if (!hasTable)
          return trx.schema.createTable(Actor.__collection_name, (table) => {
            table.string('id').primary();
            table.enum('type', ['User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount']).notNullable();
            table.string('login').notNullable();
            table.string('avatar_url').notNullable();

            // user
            table.string('bio').nullable();
            table.string('company').nullable();
            /* shared */ table.timestamp('created_at').nullable();
            /* shared */ table.integer('database_id').nullable();
            /* shared */ table.string('email').nullable();
            table.integer('followers').nullable();
            table.integer('following').nullable();
            table.integer('gists').nullable();
            table.boolean('is_bounty_hunter').nullable();
            table.boolean('is_campus_expert').nullable();
            table.boolean('is_developer_program_member').nullable();
            table.boolean('is_employee').nullable();
            table.boolean('is_hireable').nullable();
            table.boolean('is_site_admin').nullable();
            /* shared */ table.string('location').nullable();
            /* shared */ table.string('name').nullable();
            table.integer('projects').nullable();
            table.string('projects_url').nullable();
            /* shared */ table.integer('repositories').nullable();
            table.integer('repositories_contributed_to').nullable();
            table.integer('starred_repositories').nullable();
            table.json('status').nullable();
            /* shared */ table.string('twitter_username').nullable();
            /* shared */ table.timestamp('updated_at').nullable();
            table.integer('watching').nullable();
            /* shared */ table.string('website_url').nullable();

            // Organization
            table.string('description').nullable();
            table.boolean('is_verified').nullable();
            table.integer('members_with_role').nullable();
            table.integer('teams').nullable();

            // Mannequin
            /* shared: created_at, database_id, email, updated_at */
            // Bot
            /* shared: created_at, database_id, updated_at */
            // EnterpriseUserAccount
            /* shared: created_at, name, updated_at */
            table.string('user').nullable();
          });
      }),

      trx.schema.hasTable(Repository.__collection_name).then((hasTable) => {
        if (!hasTable)
          return trx.schema.createTable(Repository.__collection_name, (table) => {
            table.string('id').primary();
            table.integer('assignable_users').nullable();
            table.string('code_of_conduct').nullable();
            table.timestamp('created_at').nullable();
            table.integer('database_id').nullable();
            table.string('default_branch').nullable();
            table.boolean('delete_branch_on_merge').nullable();
            table.string('description').nullable();
            table.integer('disk_usage').nullable();
            table.integer('forks').nullable();
            table.json('funding_links').nullable();
            table.boolean('has_issues_enabled').nullable();
            table.boolean('has_projects_enabled').nullable();
            table.boolean('has_wiki_enabled').nullable();
            table.string('homepage_url').nullable();
            table.boolean('is_archived').nullable();
            table.boolean('is_blank_issues_enabled').nullable();
            table.boolean('is_disabled').nullable();
            table.boolean('is_empty').nullable();
            table.boolean('is_fork').nullable();
            table.boolean('is_in_organization').nullable();
            table.boolean('is_locked').nullable();
            table.boolean('is_mirror').nullable();
            table.boolean('is_private').nullable();
            table.boolean('is_security_policy_enabled').nullable();
            table.boolean('is_template').nullable();
            table.boolean('is_user_configuration_repository').nullable();
            table.integer('issues').nullable();
            table.integer('labels').nullable();
            table.json('languages').nullable();
            table.string('license_info').nullable();
            table.string('lock_reason').nullable();
            table.integer('mentionable_users').nullable();
            table.boolean('merge_commit_allowed').nullable();
            table.integer('milestones').nullable();
            table.integer('mirror_url').nullable();
            table.string('name').nullable();
            table.string('name_with_owner').notNullable();
            table.string('open_graph_image_url').nullable();
            table.string('owner').notNullable();
            table.string('parent').nullable();
            table.string('primary_language').nullable();
            table.timestamp('pushed_at').nullable();
            table.integer('pull_requests').nullable();
            table.boolean('rebase_merge_allowed').nullable();
            table.integer('releases').nullable();
            table.json('repository_topics').nullable();
            table.boolean('squash_merge_allowed').nullable();
            table.integer('stargazers').nullable();
            table.integer('tags').nullable();
            table.string('template_repository').nullable();
            table.timestamp('updated_at').nullable();
            table.string('url').nullable();
            table.boolean('uses_custom_open_graph_image').nullable();
            table.integer('vulnerability_alerts').nullable();
            table.integer('watchers').nullable();
          });
      }),
      trx.schema.hasTable(Metadata.__collection_name).then((hasTable) => {
        if (!hasTable)
          return trx.schema.createTable(Metadata.__collection_name, (table) => {
            table.string('repository').notNullable();
            table.string('resource').nullable();
            table.string('end_cursor').nullable();
            table.datetime('updated_at').nullable();
            table.json('payload').nullable();
            table.primary(['repository', 'resource']);
          });
      }),
      name !== 'repositories' &&
        trx.schema.hasTable(Stargazer.__collection_name).then((hasTable) => {
          if (!hasTable)
            return trx.schema.createTable(Stargazer.__collection_name, (table) => {
              table.string('repository').notNullable();
              table.string('user').notNullable();
              table.timestamp('starred_at').notNullable();
              table.primary(['repository', 'user', 'starred_at']);
            });
        }),
      name !== 'repositories' &&
        trx.schema.hasTable(Tag.__collection_name).then((hasTable) => {
          if (!hasTable)
            return trx.schema.createTable(Tag.__collection_name, (table) => {
              table.string('id').primary();
              table.string('repository').notNullable();
              table.string('message').notNullable();
              table.string('name').notNullable();
              table.string('oid').notNullable();
              table.json('tagger').notNullable();
              table.string('target').nullable();
            });
        }),
      name !== 'repositories' &&
        trx.schema.hasTable(Release.__collection_name).then((hasTable) => {
          if (!hasTable)
            return trx.schema.createTable(Release.__collection_name, (table) => {
              table.string('id').primary();
              table.string('repository').notNullable();
              table.string('author').notNullable();
              table.timestamp('created_at').notNullable();
              table.string('description').nullable();
              table.boolean('is_draft').nullable();
              table.boolean('is_prerelease').nullable();
              table.string('name').nullable();
              table.timestamp('published_at').nullable();
              table.integer('release_assets').nullable();
              table.string('tag').notNullable();
              table.string('tag_name').notNullable();
              table.timestamp('updated_at').notNullable();
            });
        }),
      name !== 'repositories' &&
        trx.schema.hasTable(Watcher.__collection_name).then((hasTable) => {
          if (!hasTable)
            return trx.schema.createTable(Watcher.__collection_name, (table) => {
              table.string('repository').notNullable();
              table.string('user').notNullable();
              table.primary(['repository', 'user']);
            });
        }),
      name !== 'repositories' &&
        trx.schema.hasTable(Dependency.__collection_name).then((hasTable) => {
          if (!hasTable)
            return trx.schema.createTable(Dependency.__collection_name, (table) => {
              table.string('repository').notNullable();
              table.string('manifest').notNullable();
              table.string('package_name').notNullable();
              table.string('filename').nullable();
              table.boolean('has_dependencies').nullable();
              table.string('package_manager').nullable();
              table.json('target_repository').nullable();
              table.string('requirements').nullable();
              table.primary(['repository', 'manifest', 'package_name', 'requirements']);
            });
        }),
    ]),
  );

  return knexInstance;
}

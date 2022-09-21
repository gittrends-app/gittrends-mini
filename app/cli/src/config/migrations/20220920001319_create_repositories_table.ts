import { Knex } from 'knex';

import { Repository } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Repository.__collection_name, (table) => {
    table.text('id').primary();
    table.integer('assignable_users').nullable();
    table.text('code_of_conduct').nullable();
    table.timestamp('created_at').nullable();
    table.integer('database_id').nullable();
    table.text('default_branch').nullable();
    table.boolean('delete_branch_on_merge').nullable();
    table.text('description').nullable();
    table.integer('disk_usage').nullable();
    table.integer('forks').nullable();
    table.json('funding_links').nullable();
    table.boolean('has_issues_enabled').nullable();
    table.boolean('has_projects_enabled').nullable();
    table.boolean('has_wiki_enabled').nullable();
    table.text('homepage_url').nullable();
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
    table.text('license_info').nullable();
    table.text('lock_reason').nullable();
    table.integer('mentionable_users').nullable();
    table.boolean('merge_commit_allowed').nullable();
    table.integer('milestones').nullable();
    table.integer('mirror_url').nullable();
    table.text('name').nullable();
    table.text('name_with_owner').notNullable();
    table.text('open_graph_image_url').nullable();
    table.text('owner').notNullable();
    table.text('parent').nullable();
    table.text('primary_language').nullable();
    table.timestamp('pushed_at').nullable();
    table.integer('pull_requests').nullable();
    table.boolean('rebase_merge_allowed').nullable();
    table.integer('releases').nullable();
    table.json('repository_topics').nullable();
    table.boolean('squash_merge_allowed').nullable();
    table.integer('stargazers').nullable();
    table.integer('tags').nullable();
    table.text('template_repository').nullable();
    table.timestamp('updated_at').nullable();
    table.text('url').nullable();
    table.boolean('uses_custom_open_graph_image').nullable();
    table.integer('vulnerability_alerts').nullable();
    table.integer('watchers').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Repository.__collection_name);
}

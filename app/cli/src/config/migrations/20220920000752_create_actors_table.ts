import { Knex } from 'knex';

import { Actor } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Actor.__collection_name, (table) => {
    table.text('id').primary();
    table.enum('type', ['User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount']).notNullable();
    table.text('login').notNullable();
    table.text('avatar_url').notNullable();

    // user
    table.text('bio').nullable();
    table.text('company').nullable();
    /* shared */ table.timestamp('created_at').nullable();
    /* shared */ table.integer('database_id').nullable();
    /* shared */ table.text('email').nullable();
    table.integer('followers').nullable();
    table.integer('following').nullable();
    table.integer('gists').nullable();
    table.boolean('is_bounty_hunter').nullable();
    table.boolean('is_campus_expert').nullable();
    table.boolean('is_developer_program_member').nullable();
    table.boolean('is_employee').nullable();
    table.boolean('is_hireable').nullable();
    table.boolean('is_site_admin').nullable();
    /* shared */ table.text('location').nullable();
    /* shared */ table.text('name').nullable();
    table.integer('projects').nullable();
    table.text('projects_url').nullable();
    /* shared */ table.integer('repositories').nullable();
    table.integer('repositories_contributed_to').nullable();
    table.integer('starred_repositories').nullable();
    table.json('status').nullable();
    /* shared */ table.text('twitter_username').nullable();
    /* shared */ table.timestamp('updated_at').nullable();
    table.integer('watching').nullable();
    /* shared */ table.text('website_url').nullable();

    // Organization
    table.text('description').nullable();
    table.boolean('is_verified').nullable();
    table.integer('members_with_role').nullable();
    table.integer('teams').nullable();

    // Mannequin
    /* shared: created_at, database_id, email, updated_at */
    // Bot
    /* shared: created_at, database_id, updated_at */
    // EnterpriseUserAccount
    /* shared: created_at, name, updated_at */
    table.text('user').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Actor.__collection_name);
}

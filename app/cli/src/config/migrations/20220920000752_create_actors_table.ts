import { Knex } from 'knex';

import { Actor } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Actor.__name, (table) => {
    table.text('id').primary();
    table.enum('type', ['User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount']).notNullable();
    table.text('login').notNullable();
    table.text('avatar_url').notNullable();

    table.timestamp('__updated_at');

    // user
    table.text('bio');
    table.text('company');
    /* shared */ table.timestamp('created_at');
    /* shared */ table.integer('database_id');
    /* shared */ table.text('email');
    table.integer('followers');
    table.integer('following');
    table.integer('gists');
    table.boolean('is_bounty_hunter');
    table.boolean('is_campus_expert');
    table.boolean('is_developer_program_member');
    table.boolean('is_employee');
    table.boolean('is_hireable');
    table.boolean('is_site_admin');
    /* shared */ table.text('location');
    /* shared */ table.text('name');
    table.integer('projects');
    table.text('projects_url');
    /* shared */ table.integer('repositories');
    table.integer('repositories_contributed_to');
    table.integer('starred_repositories');
    table.json('status');
    /* shared */ table.text('twitter_username');
    /* shared */ table.timestamp('updated_at');
    table.integer('watching');
    /* shared */ table.text('website_url');

    // Organization
    table.text('description');
    table.boolean('is_verified');
    table.integer('members_with_role');
    table.integer('teams');

    // Mannequin
    /* shared: created_at, database_id, email, updated_at */
    // Bot
    /* shared: created_at, database_id, updated_at */
    // EnterpriseUserAccount
    /* shared: created_at, name, updated_at */
    table.text('user');

    table.index('login');
    table.index('__updated_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Actor.__name);
}

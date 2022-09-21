import { Knex } from 'knex';

import { Release } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Release.__collection_name, (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('author').notNullable();
    table.timestamp('created_at').notNullable();
    table.text('description').nullable();
    table.boolean('is_draft').nullable();
    table.boolean('is_prerelease').nullable();
    table.text('name').nullable();
    table.timestamp('published_at').nullable();
    table.integer('release_assets').nullable();
    table.text('tag').notNullable();
    table.text('tag_name').notNullable();
    table.timestamp('updated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Release.__collection_name);
}

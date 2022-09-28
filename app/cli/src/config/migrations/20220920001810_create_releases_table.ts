import { Knex } from 'knex';

import { Release } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Release.__collection_name, (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('author');
    table.timestamp('created_at').notNullable();
    table.string('description');
    table.boolean('is_draft').notNullable();
    table.boolean('is_prerelease').notNullable();
    table.integer('mentions').notNullable();
    table.string('name');
    table.timestamp('published_at');
    table.json('reaction_groups').notNullable();
    table.integer('reactions').notNullable();
    table.integer('release_assets').notNullable();
    table.string('tag');
    table.string('tag_commit');
    table.string('tag_name').notNullable();
    table.timestamp('updated_at').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Release.__collection_name);
}

import { Knex } from 'knex';

import { Release } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Release.__collection_name, (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('author');
    table.timestamp('created_at').notNullable();
    table.text('description');
    table.boolean('is_draft').notNullable();
    table.boolean('is_prerelease').notNullable();
    table.integer('mentions').notNullable();
    table.text('name');
    table.timestamp('published_at');
    table.json('reaction_groups');
    table.integer('reactions').notNullable();
    table.integer('release_assets').notNullable();
    table.text('tag');
    table.text('tag_commit');
    table.text('tag_name').notNullable();
    table.timestamp('updated_at').notNullable();

    table.index(['repository', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Release.__collection_name);
}

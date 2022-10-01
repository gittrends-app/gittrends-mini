import { Knex } from 'knex';

import { Tag } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Tag.__collection_name, (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('message');
    table.text('name').notNullable();
    table.text('oid').notNullable();
    table.json('tagger').notNullable();
    table.text('target');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tag.__collection_name);
}

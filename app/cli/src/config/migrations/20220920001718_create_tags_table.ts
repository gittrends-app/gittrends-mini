import { Knex } from 'knex';

import { Tag } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Tag.__collection_name, (table) => {
    table.string('id').primary();
    table.string('repository').notNullable();
    table.string('message');
    table.string('name').notNullable();
    table.string('oid').notNullable();
    table.json('tagger').notNullable();
    table.string('target').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tag.__collection_name);
}

import { Knex } from 'knex';

import { Tag } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Tag.__name, (table) => {
    table.text('id').primary();
    table.text('repository').notNullable();
    table.text('message');
    table.text('name').notNullable();
    table.text('oid').notNullable();
    table.json('tagger');
    table.text('target');

    table.index(['repository', 'name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Tag.__name);
}

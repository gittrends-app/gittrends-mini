import { Knex } from 'knex';

import { Metadata } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Metadata.__collection_name, (table) => {
    table.text('repository').notNullable();
    table.text('resource').notNullable();
    table.text('end_cursor');
    table.timestamp('updated_at').notNullable();
    table.json('payload');

    table.primary(['repository', 'resource']);
    table.index('repository');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Metadata.__collection_name);
}

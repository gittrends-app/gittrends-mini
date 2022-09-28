import { Knex } from 'knex';

import { Metadata } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Metadata.__collection_name, (table) => {
    table.string('repository').notNullable();
    table.string('resource').nullable();
    table.string('end_cursor').nullable();
    table.timestamp('updated_at').nullable();
    table.json('payload').nullable();
    table.primary(['repository', 'resource']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Metadata.__collection_name);
}

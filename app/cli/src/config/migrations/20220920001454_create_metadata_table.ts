import { Knex } from 'knex';

import { Metadata } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Metadata.__name, (table) => {
    table.text('repository').notNullable();
    table.text('resource').notNullable();
    table.text('end_cursor');
    table.timestamp('updated_at').notNullable();
    table.json('payload');
    table.timestamp('finished_at');

    table.primary(['repository', 'resource']);
    table.index('repository');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Metadata.__name);
}

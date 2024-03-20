import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('metadata', (table) => {
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
  return knex.schema.dropTable('metadata');
}

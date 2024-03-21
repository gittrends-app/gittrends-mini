import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('watchers', (table) => {
    table.text('repository').notNullable();
    table.text('user').notNullable();
    table.primary(['repository', 'user']);

    table.index('repository');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('watchers');
}

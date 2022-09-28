import { Knex } from 'knex';

import { Watcher } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Watcher.__collection_name, (table) => {
    table.string('repository').notNullable();
    table.string('user').notNullable();
    table.primary(['repository', 'user']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Watcher.__collection_name);
}

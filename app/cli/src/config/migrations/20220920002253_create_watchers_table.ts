import { Knex } from 'knex';

import { Watcher } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Watcher.__name, (table) => {
    table.text('repository').notNullable();
    table.text('user').notNullable();
    table.primary(['repository', 'user']);

    table.index('repository');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Watcher.__name);
}

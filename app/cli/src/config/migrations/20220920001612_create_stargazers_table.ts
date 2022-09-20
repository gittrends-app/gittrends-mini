import { Knex } from 'knex';

import { Stargazer } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Stargazer.__collection_name, (table) => {
    table.string('repository').notNullable();
    table.string('user').notNullable();
    table.timestamp('starred_at').notNullable();
    table.primary(['repository', 'user', 'starred_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Stargazer.__collection_name);
}

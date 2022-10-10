import { Knex } from 'knex';

import { Repository } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(Repository.__collection_name, (table) => {
    table.dropColumn('mirror_url');
    table.text('mirror_url');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(Repository.__collection_name, (table) => {
    table.dropColumn('mirror_url');
    table.integer('mirror_url');
  });
}

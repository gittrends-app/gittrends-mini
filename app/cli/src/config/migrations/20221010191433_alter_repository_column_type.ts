import { Knex } from 'knex';

import { Repository } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Repository.__collection_name, (table) => table.dropColumn('mirror_url'));
  return knex.schema.alterTable(Repository.__collection_name, (table) => table.text('mirror_url').alter());
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(Repository.__collection_name, (table) => table.dropColumn('mirror_url'));
  return knex.schema.alterTable(Repository.__collection_name, (table) => table.integer('mirror_url').alter());
}

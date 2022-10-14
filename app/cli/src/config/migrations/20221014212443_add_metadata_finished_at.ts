import { Knex } from 'knex';

import { Metadata } from '@gittrends/entities/dist';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Metadata.__collection_name, (table) => table.timestamp('finished_at'));
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Metadata.__collection_name, (table) => table.dropColumn('finished_at'));
}

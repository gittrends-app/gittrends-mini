import { Knex } from 'knex';

import { Actor } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Actor.__collection_name, (table) => table.timestamp('__updated_at'));
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Actor.__collection_name, (table) => table.dropColumn('__updated_at'));
}

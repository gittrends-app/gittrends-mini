import { Knex } from 'knex';

import { Actor } from '@gittrends/entities/dist';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table(Actor.__collection_name, (table) => table.index('__updated_at'));
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table(Actor.__collection_name, (table) => table.dropIndex('__updated_at'));
}

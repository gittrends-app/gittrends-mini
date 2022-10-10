import { Knex } from 'knex';

import { Tag } from '@gittrends/entities';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(Tag.__collection_name, (table) => table.json('tagger').nullable().alter());
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(Tag.__collection_name, (table) => table.json('tagger').notNullable().alter());
}

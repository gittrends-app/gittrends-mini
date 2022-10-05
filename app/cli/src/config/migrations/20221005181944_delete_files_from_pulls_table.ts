import { Knex } from 'knex';

import { PullRequest } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(PullRequest.__collection_name, (table) => {
    table.dropColumn('files');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(PullRequest.__collection_name, (table) => {
    table.integer('files');
  });

  return knex.table(PullRequest.__collection_name).update(knex.raw('files = changed_files'));
}

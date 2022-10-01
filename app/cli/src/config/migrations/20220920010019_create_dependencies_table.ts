import { Knex } from 'knex';

import { Dependency } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Dependency.__collection_name, (table) => {
    table.text('repository').notNullable();
    table.text('manifest').notNullable();
    table.text('package_name').notNullable();
    table.text('filename').notNullable();
    table.text('blob_path').notNullable();
    table.boolean('has_dependencies').notNullable();
    table.text('package_manager');
    table.json('target_repository');
    table.text('requirements').notNullable();
    table.primary(['repository', 'manifest', 'package_name', 'requirements']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Dependency.__collection_name);
}

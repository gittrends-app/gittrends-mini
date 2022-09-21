import { Knex } from 'knex';

import { Dependency } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Dependency.__collection_name, (table) => {
    table.text('repository').notNullable();
    table.text('manifest').notNullable();
    table.text('package_name').notNullable();
    table.text('filename').nullable();
    table.boolean('has_dependencies').nullable();
    table.text('package_manager').nullable();
    table.json('target_repository').nullable();
    table.text('requirements').nullable();
    table.primary(['repository', 'manifest', 'package_name', 'requirements']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Dependency.__collection_name);
}

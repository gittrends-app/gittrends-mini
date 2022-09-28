import { Knex } from 'knex';

import { Dependency } from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(Dependency.__collection_name, (table) => {
    table.string('repository').notNullable();
    table.string('manifest').notNullable();
    table.string('package_name').notNullable();
    table.string('filename').nullable();
    table.boolean('has_dependencies').nullable();
    table.string('package_manager').nullable();
    table.json('target_repository').nullable();
    table.string('requirements').nullable();
    table.primary(['repository', 'manifest', 'package_name', 'requirements']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Dependency.__collection_name);
}

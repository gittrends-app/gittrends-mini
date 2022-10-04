import { Knex } from 'knex';

import {
  Actor,
  Dependency,
  Issue,
  Metadata,
  PullRequest,
  Release,
  Repository,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/lib';

export async function up(knex: Knex): Promise<void> {
  knex.schema.alterTable(Actor.__collection_name, (table) => table.index('login'));
  knex.schema.alterTable(Repository.__collection_name, (table) => table.index('name_with_owner'));
  knex.schema.alterTable(Metadata.__collection_name, (table) => table.index('repository'));
  knex.schema.alterTable(Stargazer.__collection_name, (table) => table.index(['repository', 'starred_at']));
  knex.schema.alterTable(Tag.__collection_name, (table) => table.index(['repository', 'name']));
  knex.schema.alterTable(Release.__collection_name, (table) => table.index(['repository', 'created_at']));
  knex.schema.alterTable(Watcher.__collection_name, (table) => table.index('repository'));
  knex.schema.alterTable(Dependency.__collection_name, (table) => table.index(['repository', 'manifest']));
  knex.schema.alterTable(Issue.__collection_name, (table) => table.index('repository'));
  knex.schema.alterTable(PullRequest.__collection_name, (table) => table.index('repository'));
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.alterTable(Actor.__collection_name, (table) => table.dropIndex('login'));
  knex.schema.alterTable(Repository.__collection_name, (table) => table.dropIndex('name_with_owner'));
  knex.schema.alterTable(Metadata.__collection_name, (table) => table.dropIndex('repository'));
  knex.schema.alterTable(Stargazer.__collection_name, (table) => table.dropIndex(['repository', 'starred_at']));
  knex.schema.alterTable(Tag.__collection_name, (table) => table.dropIndex(['repository', 'name']));
  knex.schema.alterTable(Release.__collection_name, (table) => table.dropIndex(['repository', 'created_at']));
  knex.schema.alterTable(Watcher.__collection_name, (table) => table.dropIndex('repository'));
  knex.schema.alterTable(Dependency.__collection_name, (table) => table.dropIndex(['repository', 'manifest']));
  knex.schema.alterTable(Issue.__collection_name, (table) => table.dropIndex('repository'));
  knex.schema.alterTable(PullRequest.__collection_name, (table) => table.dropIndex('repository'));
}

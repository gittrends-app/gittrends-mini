import { Knex } from 'knex';

import { Issue, PullRequest, Reaction, TimelineEvent } from '@gittrends/lib';

function issueOrPullBuilder(table: Knex.CreateTableBuilder) {
  table.string('id').primary();
  table.string('repository').notNullable();
  table.enum('type', ['Issue', 'PullRequest']).notNullable();
  table.string('active_lock_reason');
  table.json('assignees');
  table.string('author');
  table.string('author_association').notNullable();
  table.string('body').defaultTo('');
  table.boolean('closed').notNullable();
  table.timestamp('closed_at');
  table.timestamp('created_at').notNullable();
  table.boolean('created_via_email').notNullable();
  table.string('editor');
  table.boolean('includes_created_edit').notNullable();
  table.json('labels');
  table.timestamp('last_edited_at');
  table.boolean('locked').notNullable();
  table.string('milestone');
  table.integer('number').notNullable();
  table.json('participants');
  table.timestamp('published_at');
  table.json('reaction_groups').notNullable();
  table.integer('reactions').notNullable();
  table.string('state').notNullable();
  table.integer('timeline_items').notNullable();
  table.string('title').notNullable();
  table.timestamp('updated_at').notNullable();
}

export async function up(knex: Knex): Promise<void> {
  await Promise.all([
    knex.schema.createTable(Issue.__collection_name, (table) => {
      issueOrPullBuilder(table);
      table.boolean('is_pinned');
      table.string('state_reason');
      table.integer('tracked_in_issues').notNullable();
      table.integer('tracked_issues').notNullable();
    }),

    knex.schema.createTable(PullRequest.__collection_name, (table) => {
      issueOrPullBuilder(table);
      table.integer('additions').notNullable();
      table.json('base_ref');
      table.string('base_ref_name').notNullable();
      table.string('base_ref_oid').notNullable();
      table.string('base_repository');
      table.boolean('can_be_rebased').notNullable();
      table.integer('changed_files').notNullable();
      table.integer('closing_issues_references').notNullable();
      table.integer('commits').notNullable();
      table.integer('deletions').notNullable();
      table.integer('files').notNullable();
      table.json('head_ref');
      table.string('head_ref_name').notNullable();
      table.string('head_ref_oid').notNullable();
      table.string('head_repository');
      table.string('head_repository_owner');
      table.boolean('is_cross_repository').notNullable();
      table.boolean('is_draft').notNullable();
      table.boolean('maintainer_can_modify').notNullable();
      table.string('merge_commit');
      table.string('merge_state_status').notNullable();
      table.string('mergeable').notNullable();
      table.boolean('merged').notNullable();
      table.timestamp('merged_at');
      table.string('merged_by');
      table.string('permalink');
      table.string('potential_merge_commit');
      table.string('review_decision');
      table.integer('review_requests').notNullable();
      table.integer('reviews').notNullable();
      table.json('suggested_reviewers').notNullable();
    }),

    knex.schema.createTable(TimelineEvent.__collection_name, (table) => {
      table.string('id').primary();
      table.string('repository').notNullable();
      table.string('issue').notNullable();
      table.string('type').notNullable();
      table.json('payload');
    }),

    knex.schema.createTable(Reaction.__collection_name, (table) => {
      table.string('id').primary();
      table.string('repository').notNullable();
      table.string('reactable').notNullable();
      table.string('content').notNullable();
      table.timestamp('created_at').notNullable();
      table.string('user');
    }),
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await Promise.all([
    knex.schema.dropTable(Issue.__collection_name),
    knex.schema.dropTable(PullRequest.__collection_name),
    knex.schema.dropTable(TimelineEvent.__collection_name),
    knex.schema.dropTable(Reaction.__collection_name),
  ]);
}

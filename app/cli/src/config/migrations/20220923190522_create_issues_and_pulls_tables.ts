import { Knex } from 'knex';

import { Issue, PullRequest, Reaction, TimelineEvent } from '@gittrends/lib';

function issueOrPullBuilder(table: Knex.CreateTableBuilder) {
  table.text('id').primary();
  table.text('repository').notNullable();
  table.enum('type', ['Issue', 'PullRequest']).notNullable();
  table.text('active_lock_reason');
  table.json('assignees');
  table.text('author');
  table.text('author_association').notNullable();
  table.text('body').defaultTo('');
  table.boolean('closed').notNullable();
  table.timestamp('closed_at');
  table.timestamp('created_at').notNullable();
  table.boolean('created_via_email').notNullable();
  table.text('editor');
  table.boolean('includes_created_edit').notNullable();
  table.json('labels');
  table.timestamp('last_edited_at');
  table.boolean('locked').notNullable();
  table.text('milestone');
  table.integer('number').notNullable();
  table.json('participants');
  table.timestamp('published_at');
  table.json('reaction_groups');
  table.integer('reactions').notNullable();
  table.text('state').notNullable();
  table.integer('timeline_items').notNullable();
  table.text('title').notNullable();
  table.timestamp('updated_at').notNullable();

  table.index('repository');
}

export async function up(knex: Knex): Promise<void> {
  await Promise.all([
    knex.schema.createTable(Issue.__collection_name, (table) => {
      issueOrPullBuilder(table);
      table.boolean('is_pinned');
      table.text('state_reason');
      table.integer('tracked_in_issues').notNullable();
      table.integer('tracked_issues').notNullable();
    }),

    knex.schema.createTable(PullRequest.__collection_name, (table) => {
      issueOrPullBuilder(table);
      table.integer('additions').notNullable();
      table.json('base_ref');
      table.text('base_ref_name').notNullable();
      table.text('base_ref_oid').notNullable();
      table.text('base_repository');
      table.boolean('can_be_rebased').notNullable();
      table.integer('changed_files').notNullable();
      table.integer('closing_issues_references').notNullable();
      table.integer('commits').notNullable();
      table.integer('deletions').notNullable();
      table.json('head_ref');
      table.text('head_ref_name').notNullable();
      table.text('head_ref_oid').notNullable();
      table.text('head_repository');
      table.text('head_repository_owner');
      table.boolean('is_cross_repository').notNullable();
      table.boolean('is_draft').notNullable();
      table.boolean('maintainer_can_modify').notNullable();
      table.text('merge_commit');
      table.text('merge_state_status').notNullable();
      table.text('mergeable').notNullable();
      table.boolean('merged').notNullable();
      table.timestamp('merged_at');
      table.text('merged_by');
      table.text('permalink');
      table.text('potential_merge_commit');
      table.text('review_decision');
      table.integer('review_requests').notNullable();
      table.integer('reviews').notNullable();
      table.json('suggested_reviewers');
    }),

    knex.schema.createTable(TimelineEvent.__collection_name, (table) => {
      table.text('id').primary();
      table.text('repository').notNullable();
      table.text('issue').notNullable();
      table.text('type').notNullable();
      table.json('payload');
    }),

    knex.schema.createTable(Reaction.__collection_name, (table) => {
      table.text('id').primary();
      table.text('repository').notNullable();
      table.text('reactable').notNullable();
      table.text('reactable_type').notNullable();
      table.text('content').notNullable();
      table.timestamp('created_at').notNullable();
      table.text('user');
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

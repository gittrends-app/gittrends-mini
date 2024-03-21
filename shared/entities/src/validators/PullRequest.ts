/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { ActorSchema } from './Actor';
import { IssueOrPullSchema } from './Issue';

export const PullRequestSchema = IssueOrPullSchema.extend({
  __type: z.literal('PullRequest'),
  additions: z.number(),
  base_ref: z.object({ name: z.string(), target: z.string() }).optional(),
  base_ref_name: z.string(),
  base_ref_oid: z.string(),
  base_repository: z.string().optional(),
  can_be_rebased: z.boolean(),
  changed_files: z.number(),
  closing_issues_references: z.number(),
  commits: z.number(),
  deletions: z.number(),
  head_ref: z.union([z.string(), z.object({ name: z.string(), target: z.string() })]).optional(),
  head_ref_name: z.string().default(''),
  head_ref_oid: z.string(),
  head_repository_owner: z.union([z.string(), ActorSchema]).optional(),
  head_repository: z.string().optional(),
  is_cross_repository: z.boolean(),
  is_draft: z.boolean(),
  maintainer_can_modify: z.boolean(),
  merge_commit: z.string().optional(),
  merge_state_status: z.string(),
  mergeable: z.string(),
  merged: z.boolean(),
  merged_at: z.coerce.date().optional(),
  merged_by: z.union([z.string(), ActorSchema]).optional(),
  permalink: z.string().optional(),
  potential_merge_commit: z.string().optional(),
  review_decision: z.string().optional(),
  review_requests: z.number(),
  reviews: z.number(),
  suggested_reviewers: z.array(
    z.object({
      is_author: z.boolean(),
      is_commenter: z.boolean(),
      reviewer: z.union([z.string(), ActorSchema]),
    }),
  ),
});

export type PullRequest = z.infer<typeof PullRequestSchema>;

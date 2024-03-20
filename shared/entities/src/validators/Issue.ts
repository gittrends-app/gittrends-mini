/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { ActorSchema } from './Actor';
import { ReactionSchema } from './Reaction';
import { TimelineEventSchema } from './TimelineEvent';

export const IssueOrPullSchema = z.object({
  id: z.string(),
  repository: z.string(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]),
  type: z.enum(['Issue', 'PullRequest']),
  active_lock_reason: z.string().optional(),
  assignees: z.array(z.union([z.string(), ActorSchema])).optional(),
  author: z.union([z.string(), ActorSchema]).optional(),
  author_association: z.string(),
  body: z.string().default(''),
  closed: z.boolean(),
  closed_at: z.coerce.date().optional(),
  created_at: z.coerce.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  labels: z.array(z.string()).optional(),
  last_edited_at: z.coerce.date().optional(),
  locked: z.boolean(),
  milestone: z.string().optional(),
  number: z.number(),
  participants: z.array(z.union([z.string(), ActorSchema])).optional(),
  published_at: z.coerce.date().optional(),
  state: z.string(),
  timeline_items: z.union([z.number(), z.array(TimelineEventSchema)]),
  title: z.string().optional(),
  updated_at: z.coerce.date(),
});

export const IssueSchema = IssueOrPullSchema.extend({
  type: z.literal('Issue'),
  is_pinned: z.boolean().optional(),
  state_reason: z.string().optional(),
  tracked_in_issues: z.number(),
  tracked_issues: z.number(),
});

export type IssueOrPull = z.infer<typeof IssueOrPullSchema>;
export type Issue = z.infer<typeof IssueSchema>;

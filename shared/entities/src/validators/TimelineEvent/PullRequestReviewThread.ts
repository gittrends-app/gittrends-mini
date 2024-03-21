import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';
import { PullRequestReviewCommentSchema } from './PullRequestReviewComment';

export const PullRequestReviewThreadSchema = TimelineEventSchema.extend({
  __type: z.literal('PullRequestReviewThread'),
  comments: z.array(PullRequestReviewCommentSchema),
  diff_side: z.string(),
  is_collapsed: z.boolean(),
  is_outdated: z.boolean(),
  is_resolved: z.boolean(),
  line: z.number().optional(),
  original_line: z.number().optional(),
  original_start_line: z.number().optional(),
  path: z.string(),
  resolved_by: z.union([z.string(), ActorSchema]).optional(),
  start_diff_side: z.string().optional(),
  start_line: z.number().optional(),
});

export type PullRequestReviewThread = z.infer<typeof PullRequestReviewThreadSchema>;

import { z } from 'zod';

import { IssueSchema } from '../Issue';
import { PullRequestSchema } from '../PullRequest';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnmarkedAsDuplicateEventSchema = TimelineEventSchema.extend({
  actor: z.string().optional(),
  canonical: z.union([z.string(), IssueSchema, PullRequestSchema]).optional(),
  created_at: z.date(),
  duplicate: z.union([z.string(), IssueSchema, PullRequestSchema]).optional(),
  is_cross_repository: z.boolean(),
});

export type UnmarkedAsDuplicateEvent = z.infer<typeof UnmarkedAsDuplicateEventSchema>;

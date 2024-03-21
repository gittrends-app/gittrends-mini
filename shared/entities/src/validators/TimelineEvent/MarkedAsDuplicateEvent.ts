import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { IssueSchema } from '../Issue';
import { PullRequestSchema } from '../PullRequest';
import { TimelineEventSchema } from '../TimelineEvent';

export const MarkedAsDuplicateEventSchema = TimelineEventSchema.extend({
  __type: z.literal('MarkedAsDuplicateEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  canonical: z.union([z.string(), IssueSchema, PullRequestSchema]),
  created_at: z.coerce.date(),
  duplicate: z.union([z.string(), IssueSchema, PullRequestSchema]).optional(),
  is_cross_repository: z.boolean(),
});

export type MarkedAsDuplicateEvent = z.infer<typeof MarkedAsDuplicateEventSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';
import { PullRequestCommitSchema } from './PullRequestCommit';
import { PullRequestReviewSchema } from './PullRequestReview';

export const ReviewDismissedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ReviewDismissedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  dismissal_message: z.string().optional(),
  previous_review_state: z.string(),
  pull_request_commit: z.union([z.string(), PullRequestCommitSchema]).optional(),
  review: z.union([z.string(), PullRequestReviewSchema]).optional(),
});

export type ReviewDismissedEvent = z.infer<typeof ReviewDismissedEventSchema>;

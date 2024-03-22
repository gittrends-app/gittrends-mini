import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';
import { PullRequestReviewSchema } from './PullRequestReview';

export const ReviewDismissedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ReviewDismissedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  dismissal_message: z.string().optional(),
  previous_review_state: z.string(),
  // PullRequestCommit - pega diretamente o hash do commit
  pull_request_commit: z
    .preprocess((data: any) => (typeof data === 'object' && data.commit ? data.commit : data), z.string())
    .optional(),
  review: z.union([z.string(), PullRequestReviewSchema]).optional(),
});

export type ReviewDismissedEvent = z.infer<typeof ReviewDismissedEventSchema>;

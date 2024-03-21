import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReadyForReviewEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ReadyForReviewEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type ReadyForReviewEvent = z.infer<typeof ReadyForReviewEventSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReviewRequestedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ReviewRequestedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  requested_reviewer: z.union([z.string(), ActorSchema]).optional(),
});

export type ReviewRequestedEvent = z.infer<typeof ReviewRequestedEventSchema>;

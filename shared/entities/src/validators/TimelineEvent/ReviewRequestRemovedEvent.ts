import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReviewRequestRemovedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ReviewRequestRemovedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  requested_reviewer: z.union([z.string(), ActorSchema]).optional(),
});

export type ReviewRequestRemovedEvent = z.infer<typeof ReviewRequestRemovedEventSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReviewRequestRemovedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  requested_reviewer: z.union([z.string(), ActorSchema]).optional(),
});

export type ReviewRequestRemovedEvent = z.infer<typeof ReviewRequestRemovedEventSchema>;

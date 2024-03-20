import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReopenedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  state_reason: z.string().optional(),
});

export type ReopenedEvent = z.infer<typeof ReopenedEventSchema>;

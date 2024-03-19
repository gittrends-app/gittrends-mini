import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UserBlockedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  block_duration: z.string(),
  created_at: z.date(),
  subject: z.union([z.string(), ActorSchema]).optional(),
});

export type UserBlockedEvent = z.infer<typeof UserBlockedEventSchema>;

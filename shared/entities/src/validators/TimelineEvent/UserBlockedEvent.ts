import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UserBlockedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('UserBlockedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  block_duration: z.string(),
  created_at: z.coerce.date(),
  subject: z.union([z.string(), ActorSchema]).optional(),
});

export type UserBlockedEvent = z.infer<typeof UserBlockedEventSchema>;

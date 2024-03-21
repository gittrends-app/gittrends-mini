import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const SubscribedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('SubscribedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type SubscribedEvent = z.infer<typeof SubscribedEventSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnsubscribedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('UnsubscribedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type UnsubscribedEvent = z.infer<typeof UnsubscribedEventSchema>;
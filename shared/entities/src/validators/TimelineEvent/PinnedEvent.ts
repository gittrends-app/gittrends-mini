import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const PinnedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('PinnedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type PinnedEvent = z.infer<typeof PinnedEventSchema>;
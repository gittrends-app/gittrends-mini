import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const DemilestonedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('DemilestonedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  milestone_title: z.string(),
});

export type DemilestonedEvent = z.infer<typeof DemilestonedEventSchema>;

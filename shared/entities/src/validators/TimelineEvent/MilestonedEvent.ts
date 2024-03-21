import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const MilestonedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('MilestonedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  milestone_title: z.string(),
});

export type MilestonedEvent = z.infer<typeof MilestonedEventSchema>;

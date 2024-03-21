import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnlockedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('UnlockedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type UnlockedEvent = z.infer<typeof UnlockedEventSchema>;

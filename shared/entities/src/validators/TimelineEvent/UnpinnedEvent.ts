import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnpinnedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('UnpinnedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type UnpinnedEvent = z.infer<typeof UnpinnedEventSchema>;

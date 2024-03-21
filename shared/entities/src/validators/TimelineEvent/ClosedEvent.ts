import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ClosedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ClosedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  closer: z.object({ id: z.string(), __type: z.string(), commit: z.string().optional() }).optional(),
  created_at: z.coerce.date(),
  state_reason: z.string().optional(),
});

export type ClosedEvent = z.infer<typeof ClosedEventSchema>;

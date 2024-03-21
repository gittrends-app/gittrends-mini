import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const DisconnectedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('DisconnectedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  source: z.object({ id: z.string(), __type: z.string() }),
  subject: z.object({ id: z.string(), __type: z.string() }),
});

export type DisconnectedEvent = z.infer<typeof DisconnectedEventSchema>;

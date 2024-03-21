import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ConnectedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ConnectedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  source: z.object({ id: z.string(), __type: z.string() }),
  subject: z.object({ id: z.string(), __type: z.string() }),
});

export type ConnectedEvent = z.infer<typeof ConnectedEventSchema>;

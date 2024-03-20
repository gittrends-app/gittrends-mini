import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ConnectedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  source: z.object({ id: z.string(), type: z.string() }),
  subject: z.object({ id: z.string(), type: z.string() }),
});

export type ConnectedEvent = z.infer<typeof ConnectedEventSchema>;

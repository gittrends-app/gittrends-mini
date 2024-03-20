import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const CrossReferencedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  is_cross_repository: z.boolean(),
  referenced_at: z.coerce.date(),
  source: z.object({ type: z.string(), id: z.string() }),
  target: z.object({ type: z.string(), id: z.string() }),
  will_close_target: z.boolean(),
});

export type CrossReferencedEvent = z.infer<typeof CrossReferencedEventSchema>;

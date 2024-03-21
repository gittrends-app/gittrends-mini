import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const HeadRefRestoredEventSchema = TimelineEventSchema.extend({
  __type: z.literal('HeadRefRestoredEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type HeadRefRestoredEvent = z.infer<typeof HeadRefRestoredEventSchema>;

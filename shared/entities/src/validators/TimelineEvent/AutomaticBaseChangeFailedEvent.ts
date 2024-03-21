import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutomaticBaseChangeFailedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('AutomaticBaseChangeFailedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  new_base: z.string(),
  old_base: z.string(),
});

export type AutomaticBaseChangeFailedEvent = z.infer<typeof AutomaticBaseChangeFailedEventSchema>;

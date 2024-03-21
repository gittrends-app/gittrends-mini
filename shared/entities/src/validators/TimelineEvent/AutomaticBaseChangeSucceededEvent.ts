import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutomaticBaseChangeSucceededEventSchema = TimelineEventSchema.extend({
  __type: z.literal('AutomaticBaseChangeSucceededEvent'),
  actor: z.union([z.string(), ActorSchema]),
  created_at: z.coerce.date(),
  new_base: z.string(),
  old_base: z.string(),
});

export type AutomaticBaseChangeSucceededEvent = z.infer<typeof AutomaticBaseChangeSucceededEventSchema>;

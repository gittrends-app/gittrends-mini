import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutoSquashEnabledEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enabler: z.union([z.string(), ActorSchema]).optional(),
});

export type AutoSquashEnabledEvent = z.infer<typeof AutoSquashEnabledEventSchema>;

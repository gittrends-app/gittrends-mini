import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutoRebaseEnabledEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  enabler: z.union([z.string(), ActorSchema]).optional(),
});

export type AutoRebaseEnabledEvent = z.infer<typeof AutoRebaseEnabledEventSchema>;

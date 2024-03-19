import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutoMergeEnabledEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  enabler: z.union([z.string(), ActorSchema]).optional(),
});

export type AutoMergeEnabledEvent = z.infer<typeof AutoMergeEnabledEventSchema>;

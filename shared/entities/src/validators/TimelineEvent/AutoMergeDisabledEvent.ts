import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AutoMergeDisabledEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  disabler: z.union([z.string(), ActorSchema]).optional(),
  reason: z.string().optional(),
  reason_code: z.string().optional(),
});

export type AutoMergeDisabledEvent = z.infer<typeof AutoMergeDisabledEventSchema>;

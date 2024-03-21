import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const MergedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('MergedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  commit: z.string().optional(),
  created_at: z.coerce.date(),
  merge_ref: z.object({ name: z.string(), target: z.string() }).optional(),
  merge_ref_name: z.string(),
});

export type MergedEvent = z.infer<typeof MergedEventSchema>;

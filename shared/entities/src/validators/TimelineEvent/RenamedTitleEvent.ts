import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const RenamedTitleEventSchema = TimelineEventSchema.extend({
  __type: z.literal('RenamedTitleEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  current_title: z.string().optional(),
  previous_title: z.string().optional(),
});

export type RenamedTitleEvent = z.infer<typeof RenamedTitleEventSchema>;

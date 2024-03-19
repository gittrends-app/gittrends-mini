import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const RenamedTitleEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  current_title: z.string(),
  previous_title: z.string(),
});

export type RenamedTitleEvent = z.infer<typeof RenamedTitleEventSchema>;

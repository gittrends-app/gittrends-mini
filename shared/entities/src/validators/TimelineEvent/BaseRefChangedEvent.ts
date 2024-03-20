import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const BaseRefChangedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  current_ref_name: z.string(),
  previous_ref_name: z.string(),
});

export type BaseRefChangedEvent = z.infer<typeof BaseRefChangedEventSchema>;

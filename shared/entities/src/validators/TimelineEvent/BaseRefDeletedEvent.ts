import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const BaseRefDeletedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  base_ref_name: z.string().optional(),
  created_at: z.date(),
});

export type BaseRefDeletedEvent = z.infer<typeof BaseRefDeletedEventSchema>;

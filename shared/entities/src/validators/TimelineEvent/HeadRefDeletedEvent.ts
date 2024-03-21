import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const HeadRefDeletedEventSchema = TimelineEventSchema.extend({
  __type: z.literal('HeadRefDeletedEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  head_ref: z.object({ name: z.string(), target: z.string() }).optional(),
  head_ref_name: z.string(),
});

export type HeadRefDeletedEvent = z.infer<typeof HeadRefDeletedEventSchema>;

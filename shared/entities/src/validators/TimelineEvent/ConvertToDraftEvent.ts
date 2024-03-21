import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ConvertToDraftEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ConvertToDraftEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type ConvertToDraftEvent = z.infer<typeof ConvertToDraftEventSchema>;

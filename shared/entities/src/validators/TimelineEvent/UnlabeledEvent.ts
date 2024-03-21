import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnlabeledEventSchema = TimelineEventSchema.extend({
  __type: z.literal('UnlabeledEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  label: z.string(),
});

export type UnlabeledEvent = z.infer<typeof UnlabeledEventSchema>;

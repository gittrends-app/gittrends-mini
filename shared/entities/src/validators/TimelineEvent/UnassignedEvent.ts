import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const UnassignedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  assignee: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
});

export type UnassignedEvent = z.infer<typeof UnassignedEventSchema>;

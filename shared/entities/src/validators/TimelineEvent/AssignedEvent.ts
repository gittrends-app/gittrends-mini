import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const AssignedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  assignee: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
});

export type AssignedEvent = z.infer<typeof AssignedEventSchema>;

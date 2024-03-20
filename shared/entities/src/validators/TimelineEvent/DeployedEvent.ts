import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const DeployedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  deployment: z.string(),
  ref: z.object({ name: z.string(), target: z.string() }).optional(),
});

export type DeployedEvent = z.infer<typeof DeployedEventSchema>;

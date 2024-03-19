import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const RemovedFromProjectEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  project: z.string().optional(),
  project_column_name: z.string(),
});

export type RemovedFromProjectEvent = z.infer<typeof RemovedFromProjectEventSchema>;

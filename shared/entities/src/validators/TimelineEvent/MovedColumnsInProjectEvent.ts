import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const MovedColumnsInProjectEventSchema = TimelineEventSchema.extend({
  __type: z.literal('MovedColumnsInProjectEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  previous_project_column_name: z.string(),
  project: z.string().optional(),
  project_card: z.string().optional(),
  project_column_name: z.string(),
});

export type MovedColumnsInProjectEvent = z.infer<typeof MovedColumnsInProjectEventSchema>;

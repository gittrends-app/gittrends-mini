import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ReferencedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  commit: z.string().optional(),
  commit_repository: z.string(),
  created_at: z.date(),
  is_cross_repository: z.boolean(),
  is_direct_reference: z.boolean(),
});

export type ReferencedEvent = z.infer<typeof ReferencedEventSchema>;

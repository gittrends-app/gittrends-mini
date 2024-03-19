import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const TransferredEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  from_repository: z.object({ id: z.string(), name_with_owner: z.string() }).optional(),
});

export type TransferredEvent = z.infer<typeof TransferredEventSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ConvertedToDiscussionEventSchema = TimelineEventSchema.extend({
  __type: z.literal('ConvertedToDiscussionEvent'),
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  discussion: z.string().optional(),
});

export type ConvertedToDiscussionEvent = z.infer<typeof ConvertedToDiscussionEventSchema>;

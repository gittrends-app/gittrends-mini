import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const MentionedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
});

export type MentionedEvent = z.infer<typeof MentionedEventSchema>;

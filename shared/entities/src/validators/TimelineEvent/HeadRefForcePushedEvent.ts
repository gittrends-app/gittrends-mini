import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const HeadRefForcePushedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  after_commit: z.string(),
  before_commit: z.string(),
  created_at: z.date(),
  ref: z.object({ name: z.string(), target: z.string() }),
});

export type HeadRefForcePushedEvent = z.infer<typeof HeadRefForcePushedEventSchema>;

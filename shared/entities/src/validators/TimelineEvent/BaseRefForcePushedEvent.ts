import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const BaseRefForcePushedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  after_commit: z.string().optional(),
  before_commit: z.string().optional(),
  created_at: z.date(),
  ref: z.object({ name: z.string(), target: z.string() }).optional(),
});

export type BaseRefForcePushedEvent = z.infer<typeof BaseRefForcePushedEventSchema>;

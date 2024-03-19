/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

export const TimelineEventSchema = z.object({
  id: z.string(),
  repository: z.string(),
  issue: z.string(),
  type: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

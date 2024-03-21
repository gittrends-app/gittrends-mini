/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { GithubEntitySchema } from './GithubEntity';

export const TimelineEventSchema = GithubEntitySchema.extend({
  id: z.string(),
  repository: z.string(),
  issue: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

import { z } from 'zod';

import { TimelineEventSchema } from '../TimelineEvent';

export const PullRequestRevisionMarkerSchema = TimelineEventSchema.extend({
  created_at: z.date(),
  last_seen_commit: z.string(),
});

export type PullRequestRevisionMarker = z.infer<typeof PullRequestRevisionMarkerSchema>;

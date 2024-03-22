import { z } from 'zod';

import { TimelineEventSchema } from '../TimelineEvent';

export const PullRequestRevisionMarkerSchema = TimelineEventSchema.extend({
  __type: z.literal('PullRequestRevisionMarker'),
  created_at: z.coerce.date(),
  last_seen_commit: z.string(),
});

export type PullRequestRevisionMarker = z.infer<typeof PullRequestRevisionMarkerSchema>;
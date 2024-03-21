import { z } from 'zod';

import { TimelineEventSchema } from '../TimelineEvent';

export const PullRequestCommitSchema = TimelineEventSchema.extend({
  __type: z.literal('PullRequestCommit'),
  commit: z.string(),
});

export type PullRequestCommit = z.infer<typeof PullRequestCommitSchema>;

import { z } from 'zod';

import { TimelineEventSchema } from '../TimelineEvent';
import { CommitCommentSchema } from './CommitComment';

export const PullRequestCommitCommentThreadSchema = TimelineEventSchema.extend({
  __type: z.literal('PullRequestCommitCommentThread'),
  comments: z.array(CommitCommentSchema),
  commit: z.string(),
  path: z.string().optional(),
  position: z.number().optional(),
});

export type PullRequestCommitCommentThread = z.infer<typeof PullRequestCommitCommentThreadSchema>;

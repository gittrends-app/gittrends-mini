import { z } from 'zod';

import { CommitCommentSchema } from './CommitComment';

export const PullRequestReviewCommentSchema = CommitCommentSchema.extend({
  // TODO - According to the documentation, this field is required, but it is not present in the response
  diff_hunk: z.string().optional(),
  drafted_at: z.coerce.date(),
  is_minimized: z.boolean(),
  minimized_reason: z.string().optional(),
  original_commit: z.string().optional(),
  original_position: z.number(),
  outdated: z.boolean(),
  reply_to: z.string().optional(),
  state: z.string(),
}).refine((data) => {
  if (!data.reactions && data.reaction_groups) data.reactions = Object.keys(data.reaction_groups).length;
  return data;
});

export type PullRequestReviewComment = z.infer<typeof PullRequestReviewCommentSchema>;

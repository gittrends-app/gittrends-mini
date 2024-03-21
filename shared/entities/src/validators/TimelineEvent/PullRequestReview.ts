import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { ReactionSchema } from '../Reaction';
import { TimelineEventSchema } from '../TimelineEvent';
import { PullRequestReviewCommentSchema } from './PullRequestReviewComment';

export const PullRequestReviewSchema = TimelineEventSchema.extend({
  __type: z.literal('PullRequestReview'),
  author_association: z.string(),
  author_can_push_to_repository: z.boolean(),
  author: z.union([z.string(), ActorSchema]).optional(),
  body: z.string().optional(),
  comments: z.array(PullRequestReviewCommentSchema),
  commit: z.string().optional(),
  created_at: z.coerce.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  last_edited_at: z.coerce.date().optional(),
  published_at: z.coerce.date().optional(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]),
  state: z.string(),
  submitted_at: z.coerce.date().optional(),
  updated_at: z.coerce.date(),
});

export type PullRequestReview = z.infer<typeof PullRequestReviewSchema>;

import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { ReactionSchema } from '../Reaction';
import { TimelineEventSchema } from '../TimelineEvent';
import { PullRequestReviewCommentSchema } from './PullRequestReviewComment';

export const PullRequestReviewSchema = TimelineEventSchema.extend({
  author_association: z.string(),
  author_can_push_to_repository: z.boolean(),
  author: z.union([z.string(), ActorSchema]).optional(),
  body: z.string().optional(),
  comments: z.array(PullRequestReviewCommentSchema),
  commit: z.string().optional(),
  created_at: z.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  last_edited_at: z.date().optional(),
  published_at: z.date().optional(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]),
  state: z.string(),
  submitted_at: z.date().optional(),
  updated_at: z.date(),
});

export type PullRequestReview = z.infer<typeof PullRequestReviewSchema>;

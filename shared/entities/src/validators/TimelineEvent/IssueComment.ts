import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { ReactionSchema } from '../Reaction';
import { TimelineEventSchema } from '../TimelineEvent';

export const IssueCommentSchema = TimelineEventSchema.extend({
  __type: z.literal('IssueComment'),
  author_association: z.string(),
  author: z.union([z.string(), ActorSchema]).optional(),
  body: z.string(),
  created_at: z.coerce.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  is_minimized: z.boolean(),
  last_edited_at: z.coerce.date().optional(),
  minimized_reason: z.string().optional(),
  published_at: z.coerce.date().optional(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]),
  updated_at: z.coerce.date(),
});

export type IssueComment = z.infer<typeof IssueCommentSchema>;

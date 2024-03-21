import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { ReactionSchema } from '../Reaction';
import { TimelineEventSchema } from '../TimelineEvent';

export const CommitCommentSchema = TimelineEventSchema.extend({
  __type: z.literal('CommitComment'),
  author_association: z.string(),
  author: z.union([z.string(), ActorSchema]).optional(),
  body: z.string(),
  commit: z.string().optional(),
  created_at: z.coerce.date(),
  created_via_email: z.boolean(),
  editor: z.union([z.string(), ActorSchema]).optional(),
  includes_created_edit: z.boolean(),
  last_edited_at: z.coerce.date().optional(),
  path: z.string().optional(),
  position: z.number().optional(),
  published_at: z.coerce.date().optional(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]).optional(),
  updated_at: z.coerce.date(),
});

export type CommitComment = z.infer<typeof CommitCommentSchema>;

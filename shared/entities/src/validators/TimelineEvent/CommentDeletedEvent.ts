import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const CommentDeletedEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  deleted_comment_author: z.union([z.string(), ActorSchema]).optional(),
});

export type CommentDeletedEvent = z.infer<typeof CommentDeletedEventSchema>;

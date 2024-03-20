import { z } from 'zod';

import { ActorSchema } from '../Actor';
import { TimelineEventSchema } from '../TimelineEvent';

export const ConvertedNoteToIssueEventSchema = TimelineEventSchema.extend({
  actor: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.coerce.date(),
  project: z.string().optional(),
  project_card: z.string().optional(),
  project_column_name: z.string(),
});

export type ConvertedNoteToIssueEvent = z.infer<typeof ConvertedNoteToIssueEventSchema>;

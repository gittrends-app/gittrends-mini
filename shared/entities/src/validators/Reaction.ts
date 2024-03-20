/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { ActorSchema } from './Actor';

export const ReactionSchema = z.object({
  id: z.string(),
  repository: z.string(),
  reactable: z.string(),
  reactable_type: z.string(),
  content: z.string(),
  created_at: z.coerce.date(),
  user: z.union([z.string(), ActorSchema]).optional(),
});

export type Reaction = z.infer<typeof ReactionSchema>;

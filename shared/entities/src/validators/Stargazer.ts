/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';

export const StargazerSchema = z.object({
  repository: z.string(),
  user: z.union([z.string(), UserSchema]),
  starred_at: z.date(),
});

export type TStargazer = z.infer<typeof StargazerSchema>;

/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';
import { GithubEntitySchema } from './GithubEntity';

export const StargazerSchema = GithubEntitySchema.extend({
  __type: z.literal('Stargazer'),
  repository: z.string(),
  user: z.union([z.string(), UserSchema]),
  starred_at: z.coerce.date(),
});

export type Stargazer = z.infer<typeof StargazerSchema>;

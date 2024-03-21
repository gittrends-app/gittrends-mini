/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';
import { GithubEntitySchema } from './GithubEntity';

export const WatcherSchema = GithubEntitySchema.extend({
  __type: z.literal('Watcher'),
  repository: z.string(),
  user: z.union([z.string(), UserSchema]),
});

export type Watcher = z.infer<typeof WatcherSchema>;

/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';

export const WatcherSchema = z.object({
  repository: z.string(),
  user: z.union([z.string(), UserSchema]),
});

export type Watcher = z.infer<typeof WatcherSchema>;

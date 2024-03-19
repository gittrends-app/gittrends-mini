/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';

export const TagSchema = z.object({
  id: z.string(),
  repository: z.string(),
  message: z.string().optional(),
  name: z.string(),
  oid: z.string(),
  tagger: z.object({
    date: z.date(),
    email: z.string().optional(),
    name: z.string(),
    user: z.union([z.string(), UserSchema]),
  }),
  target: z.string().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

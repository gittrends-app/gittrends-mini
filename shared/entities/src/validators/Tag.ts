/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { UserSchema } from './Actor';
import { GithubEntitySchema } from './GithubEntity';

export const TagSchema = GithubEntitySchema.extend({
  __type: z.literal('Tag'),
  id: z.string(),
  repository: z.string(),
  message: z.string().optional(),
  name: z.string(),
  oid: z.string(),
  tagger: z
    .object({
      date: z.coerce.date(),
      email: z.string().optional(),
      name: z.string().default(''),
      user: z.union([z.string(), UserSchema]).optional(),
    })
    .optional(),
  target: z.string().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

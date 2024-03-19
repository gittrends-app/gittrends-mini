/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { ActorSchema } from './Actor';
import { ReactionSchema } from './Reaction';

export const ReleaseSchema = z.object({
  id: z.string(),
  repository: z.string(),
  author: z.union([z.string(), ActorSchema]).optional(),
  created_at: z.date(),
  description: z.string().optional(),
  is_draft: z.boolean(),
  is_prerelease: z.boolean(),
  mentions: z.number(),
  name: z.string().optional(),
  published_at: z.date().optional(),
  reaction_groups: z.record(z.number()),
  reactions: z.union([z.number(), z.array(ReactionSchema)]),
  release_assets: z.number(),
  tag: z.string().optional(),
  tag_commit: z.string().optional(),
  tag_name: z.string(),
  updated_at: z.date(),
});

export type Release = z.infer<typeof ReleaseSchema>;

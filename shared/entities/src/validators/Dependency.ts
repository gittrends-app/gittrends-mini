/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

export const DependencySchema = z.object({
  repository: z.string(),
  manifest: z.string(),
  package_name: z.string(),
  filename: z.string(),
  blob_path: z.string(),
  has_dependencies: z.boolean(),
  package_manager: z.string().optional(),
  target_repository: z
    .union([
      z.object({
        id: z.string(),
        database_id: z.number(),
        name_with_owner: z.string(),
      }),
      z.string(),
    ])
    .optional(),
  requirements: z.string().default(''),
});

export type Dependency = z.infer<typeof DependencySchema>;

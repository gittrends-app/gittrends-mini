/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

export const MetadataSchema = z
  .object({
    repository: z.string(),
    resource: z.string(),
    resource_id: z.string().optional(),
    end_cursor: z.string().optional(),
    updated_at: z.date().optional(),
    finished_at: z.date().optional(),
  })
  .passthrough();

export type Metadata = z.infer<typeof MetadataSchema>;

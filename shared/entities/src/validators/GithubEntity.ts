import { z } from 'zod';

export const GithubEntitySchema = z.object({
  __type: z.string(),
});

export type GithubEntity = z.infer<typeof GithubEntitySchema>;

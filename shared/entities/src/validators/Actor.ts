/*
 *  Author: Hudson S. Borges
 */
import { z } from 'zod';

import { GithubEntitySchema } from './GithubEntity';

export const ActorSchema = GithubEntitySchema.extend({
  id: z.string(),
  login: z.string(),
  avatar_url: z.string().optional(),
  __type: z.enum(['User', 'Organization', 'Mannequin', 'Bot', 'EnterpriseUserAccount']),
  __updated_at: z.coerce.date().optional(),
});

export const UserSchema = ActorSchema.extend({
  __type: z.literal('User'),
  bio: z.string().optional(),
  company: z.string().optional(),
  created_at: z.coerce.date().optional(),
  database_id: z.number().optional(),
  email: z.string().optional(),
  followers: z.number().optional(),
  following: z.number().optional(),
  gists: z.number().optional(),
  is_bounty_hunter: z.boolean().optional(),
  is_campus_expert: z.boolean().optional(),
  is_developer_program_member: z.boolean().optional(),
  is_employee: z.boolean().optional(),
  is_hireable: z.boolean().optional(),
  is_site_admin: z.boolean().optional(),
  location: z.string().optional(),
  name: z.string().optional(),
  projects: z.number().optional(),
  projects_url: z.string().optional(),
  repositories: z.number().optional(),
  repositories_contributed_to: z.number().optional(),
  starred_repositories: z.number().optional(),
  status: z
    .object({
      created_at: z.coerce.date(),
      emoji: z.string().optional(),
      expires_at: z.coerce.date().optional(),
      indicates_limited_availability: z.boolean().optional(),
      message: z.string().optional(),
      updated_at: z.coerce.date().optional(),
    })
    .optional(),
  twitter_username: z.string().optional(),
  updated_at: z.coerce.date().optional(),
  watching: z.number().optional(),
  website_url: z.string().optional(),
});

export const OrganizationSchema = ActorSchema.extend({
  __type: z.literal('Organization'),
  created_at: z.coerce.date().optional(),
  database_id: z.number().optional(),
  description: z.string().optional(),
  email: z.string().optional(),
  is_verified: z.boolean().optional(),
  location: z.string().optional(),
  members_with_role: z.number().optional(),
  name: z.string().optional(),
  repositories: z.number().optional(),
  teams: z.number().optional(),
  twitter_username: z.string().optional(),
  updated_at: z.coerce.date().optional(),
  website_url: z.string().optional(),
});

export const MannequinSchema = ActorSchema.extend({
  __type: z.literal('Mannequin'),
  created_at: z.coerce.date().optional(),
  database_id: z.number().optional(),
  email: z.string().optional(),
  updated_at: z.coerce.date().optional(),
});

export const BotSchema = ActorSchema.extend({
  __type: z.literal('Bot'),
  created_at: z.coerce.date().optional(),
  database_id: z.number().optional(),
  updated_at: z.coerce.date().optional(),
});

export const EnterpriseUserAccountSchema = ActorSchema.extend({
  __type: z.literal('EnterpriseUserAccount'),
  created_at: z.coerce.date().optional(),
  name: z.string().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.string().optional(),
});

export type Actor = z.infer<typeof ActorSchema>;
export type User = z.infer<typeof UserSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Mannequin = z.infer<typeof MannequinSchema>;
export type Bot = z.infer<typeof BotSchema>;
export type EnterpriseUserAccount = z.infer<typeof EnterpriseUserAccountSchema>;

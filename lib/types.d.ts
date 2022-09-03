export type User = {
  avatar_url: string;
  created_at: Date;
  database_id: number;
  email: string;
  id: string;
  location: string;
  login: string;
  name: string;
  twitter_username: string;
  type: string;
  updated_at: Date;
  website_url: string;
};

export type Repository = {
  created_at: Date;
  database_id: number;
  default_branch: string;
  description: string;
  forks: number;
  id: string;
  name: string;
  name_with_owner: string;
  owner: User;
  primary_language: string;
  pushed_at: Date;
  stargazers: number;
  updated_at: Date;
};

export type Stargazer = {
  starred_at: Date;
  user: User;
};

export type RepositoryResources = 'stargazers' | 'repository';

export type RepositoryMetadata = {
  repository: string;
  resource: RepositoryResources;
  end_cursor?: string;
  updated_at: Date;
};

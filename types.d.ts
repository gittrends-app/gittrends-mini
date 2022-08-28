export interface Usuario {
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
}

export interface Repositorio {
  created_at: Date;
  database_id: number;
  default_branch: string;
  description: string;
  forks: number;
  id: string;
  name: string;
  name_with_owner: string;
  owner: Usuario;
  primary_language: string;
  pushed_at: Date;
  stargazers: number;
  updated_at: Date;
}

export interface Estrela {
  starred_at: Date;
  user: Usuario;
}

export interface RepositorioMetadata {
  repository: string;
  resource: 'stargazers';
  end_cursor?: string;
  has_next_page?: boolean;
}

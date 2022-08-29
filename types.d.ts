export interface Estrela {
  starred_at: Date;
  user: {
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
}

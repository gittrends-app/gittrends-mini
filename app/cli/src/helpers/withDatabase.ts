import { Knex } from 'knex';

import { createOrConnectDatabase } from '../config/knex.config';
import { ActorsRepository } from '../repositories/ActorRepository';
import { DependenciesRepository } from '../repositories/DependenciesRepository';
import { IssuesRepository, PullRequestsRepository } from '../repositories/IssuesRepository';
import { MetadataRepository } from '../repositories/MetadataRepository';
import { ReleasesRepository } from '../repositories/ReleasesRepository';
import { RepositoriesRepository } from '../repositories/RepositoriesRepository';
import { StargazersRepository } from '../repositories/StargazersRepository';
import { TagsRepository } from '../repositories/TagsRepository';
import { WatchersRepository } from '../repositories/WatchersRepository';

type Repositories = {
  knex: Knex;
  actors: ActorsRepository;
  repositories: RepositoriesRepository;
  stargazers: StargazersRepository;
  tags: TagsRepository;
  releases: ReleasesRepository;
  watchers: WatchersRepository;
  dependencies: DependenciesRepository;
  metadata: MetadataRepository;
  issues: IssuesRepository;
  pull_requests: PullRequestsRepository;
};

export async function withDatabase<T>(context: (repos: Repositories) => Promise<T>): Promise<T>;
export async function withDatabase<T>(db: string, context: (repos: Repositories) => Promise<T>): Promise<T>;
export async function withDatabase<T>(
  config: { name: string; migrate?: boolean },
  context: (repos: Repositories) => Promise<T>,
): Promise<T>;
export async function withDatabase<T>(db: any, context?: any): Promise<T> {
  let config: { name: string; migrate?: boolean } = { name: 'public', migrate: false };
  let callback: (repos: Repositories) => Promise<any>;

  if (typeof db !== 'function') {
    if (typeof db === 'string') config.name = db;
    else if (typeof db === 'object') config = db;
    callback = context;
  } else {
    callback = db;
  }

  const knex = await createOrConnectDatabase(config.name, config.migrate);

  const repos: Repositories = {
    knex,
    actors: new ActorsRepository(knex),
    repositories: new RepositoriesRepository(knex),
    stargazers: new StargazersRepository(knex),
    tags: new TagsRepository(knex),
    releases: new ReleasesRepository(knex),
    watchers: new WatchersRepository(knex),
    dependencies: new DependenciesRepository(knex),
    metadata: new MetadataRepository(knex),
    issues: new IssuesRepository(knex),
    pull_requests: new PullRequestsRepository(knex),
  };

  return callback(repos).finally(() => knex.destroy());
}

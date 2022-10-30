import { Knex } from 'knex';

import { createOrConnectDatabase, migrate } from '../config/knex.config';
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

  if (typeof db === 'function') {
    callback = db;
  } else {
    if (typeof db === 'string') config.name = db;
    else config = db;
    callback = context;
  }

  const knex = await createOrConnectDatabase(config.name).then(async (conn) => {
    if (config.migrate) {
      await migrate(conn);
    } else {
      const [, pending] = await conn.migrate.list();
      if (pending.length)
        throw new Error(`Database schema from "${config.name}" is not updated! See "migrations" information.`);
    }
    return conn;
  });

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

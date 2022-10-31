import { Knex } from 'knex';
import { Dependency } from 'webpack';

import {
  Actor,
  Entity,
  Issue,
  Metadata,
  PullRequest,
  Release,
  Repository,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/entities/dist';

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

type Newable<T> = { new (...args: any[]): T };

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
  get(resource: Newable<Entity>): any;
  get(resource: Newable<Actor>): ActorsRepository;
  get(resource: Newable<Repository>): RepositoriesRepository;
  get(resource: Newable<Stargazer>): StargazersRepository;
  get(resource: Newable<Tag>): TagsRepository;
  get(resource: Newable<Release>): ReleasesRepository;
  get(resource: Newable<Watcher>): WatchersRepository;
  get(resource: Newable<Dependency>): DependenciesRepository;
  get(resource: Newable<Metadata>): MetadataRepository;
  get(resource: Newable<Issue>): IssuesRepository;
  get(resource: Newable<PullRequest>): PullRequestsRepository;
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
    get: function <T>(resource: Newable<T>): any {
      if (resource.name === Actor.name) return new ActorsRepository(knex);
      else if (resource.name === Repository.name) return new RepositoriesRepository(knex);
      else if (resource.name === Stargazer.name) return new StargazersRepository(knex);
      else if (resource.name === Tag.name) return new TagsRepository(knex);
      else if (resource.name === Release.name) return new ReleasesRepository(knex);
      else if (resource.name === Watcher.name) return new WatchersRepository(knex);
      else if (resource.name === Dependency.name) return new DependenciesRepository(knex);
      else if (resource.name === Metadata.name) return new MetadataRepository(knex);
      else if (resource.name === Issue.name) return new IssuesRepository(knex);
      else if (resource.name === PullRequest.name) return new PullRequestsRepository(knex);
      throw new Error(`No repository for ${resource.constructor.name}.`);
    },
  };

  return callback(repos).finally(() => knex.destroy());
}

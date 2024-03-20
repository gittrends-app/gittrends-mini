import { Knex } from 'knex';

import { EntityRepositories } from '@gittrends/service';

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

export type ExtendedEntityRepositories = EntityRepositories & { knex: Knex };

export async function withDatabase<T>(context: (repos: ExtendedEntityRepositories) => Promise<T>): Promise<T>;

export async function withDatabase<T>(
  db: string,
  context: (repos: ExtendedEntityRepositories) => Promise<T>,
): Promise<T>;
export async function withDatabase<T>(
  config: { name: string; migrate?: boolean },
  context: (repos: ExtendedEntityRepositories) => Promise<T>,
): Promise<T>;

export async function withDatabase(db: string): Promise<ExtendedEntityRepositories>;
export async function withDatabase(config: { name: string; migrate?: boolean }): Promise<ExtendedEntityRepositories>;

export async function withDatabase<T>(db: any, context?: any): Promise<T> {
  let config: { name: string; migrate?: boolean } = { name: 'public', migrate: false };
  let callback: ((repos: EntityRepositories) => Promise<any>) | undefined;

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
    } else if (process.env.CLI_MIGRATIONS_DISABLE_VALIDATION?.toLowerCase() !== 'true') {
      const [, pending] = await conn.migrate.list();
      if (pending.length)
        throw new Error(`Database schema from "${config.name}" is not updated! See "migrations" information.`);
    }
    return conn;
  });

  const repos: ExtendedEntityRepositories = {
    knex,
    get: function (resource: string): any {
      if (resource === 'actors') return new ActorsRepository(knex);
      else if (resource === 'repositories') return new RepositoriesRepository(knex);
      else if (resource === 'stargazers') return new StargazersRepository(knex);
      else if (resource === 'tags') return new TagsRepository(knex);
      else if (resource === 'releases') return new ReleasesRepository(knex);
      else if (resource === 'watchers') return new WatchersRepository(knex);
      else if (resource === 'dependencies') return new DependenciesRepository(knex);
      else if (resource === 'metadata') return new MetadataRepository(knex);
      else if (resource === 'issues') return new IssuesRepository(knex);
      else if (resource === 'pull_requests') return new PullRequestsRepository(knex);
      throw new Error(`No repository for ${resource}.`);
    },
  };

  return callback ? callback(repos).finally(() => knex.destroy()) : repos;
}

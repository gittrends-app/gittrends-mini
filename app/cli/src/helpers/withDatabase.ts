import { Knex } from 'knex';

import { createOrConnectDatabase } from '../config/knex.config';
import { ActorsRepository } from '../repos/ActorRepository';
import { DependenciesRepository } from '../repos/DependenciesRepository';
import { MetadataRepository } from '../repos/MetadataRepository';
import { ReleasesRepository } from '../repos/ReleasesRepository';
import { RepositoriesRepository } from '../repos/RepositoriesRepository';
import { StargazersRepository } from '../repos/StargazersRepository';
import { TagsRepository } from '../repos/TagsRepository';
import { WatchersRepository } from '../repos/WatchersRepository';

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
};

type TCallback<T> = (repos: Repositories) => Promise<T>;

export async function withDatabase<T>(db: string | TCallback<T>, context?: TCallback<T>): Promise<T> {
  const dbName = typeof db === 'function' ? 'public' : db;
  const callback = typeof db === 'function' ? db : context;

  if (!callback) throw new Error('Callback function is mandatory!');

  const knex = await createOrConnectDatabase(dbName);

  return callback({
    knex,
    actors: new ActorsRepository(knex),
    repositories: new RepositoriesRepository(knex),
    stargazers: new StargazersRepository(knex),
    tags: new TagsRepository(knex),
    releases: new ReleasesRepository(knex),
    watchers: new WatchersRepository(knex),
    dependencies: new DependenciesRepository(knex),
    metadata: new MetadataRepository(knex),
  }).finally(() => knex.destroy());
}

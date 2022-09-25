import { Knex } from 'knex';

import { createOrConnectDatabase } from '../config/knex.config';
import { ActorsRepository } from '../repos/ActorRepository';
import { DependenciesRepository } from '../repos/DependenciesRepository';
import { IssuesRepository } from '../repos/IssuesRepository';
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
  issues: IssuesRepository;
};

export async function withDatabase<T>(db: string, context: (repos: Repositories) => Promise<T>): Promise<T> {
  const knex = await createOrConnectDatabase(db);

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
  };

  return context(repos).finally(() => knex.destroy());
}

import { ActorsRepository } from '../repos/ActorRepository';
import { DependenciesRepository } from '../repos/DependenciesRepository';
import { MetadataRepository } from '../repos/MetadataRepository';
import { ReleasesRepository } from '../repos/ReleasesRepository';
import { RepositoriesRepository } from '../repos/RepositoriesRepository';
import { StargazersRepository } from '../repos/StargazersRepository';
import { TagsRepository } from '../repos/TagsRepository';
import { WatchersRepository } from '../repos/WatchersRepository';
import { createOrConnectDatabase } from '../sqlite.config';

type Repositories = {
  actors: ActorsRepository;
  repositories: RepositoriesRepository;
  stargazers: StargazersRepository;
  tags: TagsRepository;
  releases: ReleasesRepository;
  watchers: WatchersRepository;
  dependencies: DependenciesRepository;
  metadata: MetadataRepository;
};
export async function withDatabase(
  db = 'repositories',
  context: (repos: Repositories) => Promise<void>,
): Promise<void> {
  const knex = await createOrConnectDatabase(db);

  await context({
    actors: new ActorsRepository(knex),
    repositories: new RepositoriesRepository(knex),
    stargazers: new StargazersRepository(knex),
    tags: new TagsRepository(knex),
    releases: new ReleasesRepository(knex),
    watchers: new WatchersRepository(knex),
    dependencies: new DependenciesRepository(knex),
    metadata: new MetadataRepository(knex),
  }).finally(async () => {
    knex.destroy();
  });
}

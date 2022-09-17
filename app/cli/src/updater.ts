import { MultiBar, Presets } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { get } from 'lodash';
import { URL } from 'node:url';

import { Actor, Dependency, ProxyService, Release, Stargazer, Tag, Watcher } from '@gittrends/lib';
import { HttpClient } from '@gittrends/lib';

import { version } from './package.json';
import { ActorsRepository } from './repos/ActorRepository';
import { DependenciesRepository } from './repos/DependenciesRepository';
import { MetadataRepository } from './repos/MetadataRepository';
import { ReleasesRepository } from './repos/ReleasesRepository';
import { RepositoriesRepository } from './repos/RepositoriesRepository';
import { StargazersRepository } from './repos/StargazersRepository';
import { TagsRepository } from './repos/TagsRepository';
import { WatchersRepository } from './repos/WatchersRepository';
import { createOrConnectDatabase } from './sqlite.config';

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

async function withDatabase(db = 'repositories', context: (repos: Repositories) => Promise<void>): Promise<void> {
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

async function withMultibar(context: (multibar: MultiBar) => Promise<void>): Promise<void> {
  const multibar = new MultiBar(
    {
      format: '{resource} [{bar}] {eta_formatted} | {value}/{total} ({percentage}%)',
      stopOnComplete: true,
      clearOnComplete: true,
      hideCursor: true,
      autopadding: true,
    },
    Presets.rect,
  );

  await context(multibar).finally(() => {
    multibar.stop();
  });
}

async function exec(args: string[] = process.argv, from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addArgument(new Argument('<repo>', 'Repository name with format <owner/name>'))
    .addOption(new Option('--token [string]', 'Github access token').env('TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').conflicts('token'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices([Stargazer, Tag, Release, Watcher, Dependency].map((r) => r.__collection_name).concat(['all']))
        .default(['all']),
    )
    .addOption(new Option('--no-progress', 'Disable progress bars'))
    .action(async (name, opts: { token?: string; apiUrl?: string; resources: string[]; progress: boolean }) => {
      consola.info('Opening local cache database ...');
      return withDatabase('repositories', async (globalRepos): Promise<void> => {
        const { actors: actorsRepo } = globalRepos;

        const apiURL = new URL((opts.token ? 'https://api.github.com' : opts.apiUrl) as string);

        const httpClient = new HttpClient({
          host: apiURL.hostname,
          protocol: apiURL.protocol.slice(0, -1),
          port: parseInt(apiURL.port),
          authToken: opts.token,
        });

        const globalService = new ProxyService(httpClient, globalRepos);

        consola.info(`Finding repository "${name}" ...`);
        const repo = await globalService.find(name);

        if (!repo) throw new Error('Repository not found!');
        const owner = repo.owner instanceof Actor ? repo.owner : await actorsRepo.findById(repo.owner);

        consola.info('Opening repository local database ...');
        return withDatabase(repo.name_with_owner, async (localRepos) => {
          await withMultibar(async (multibar) => {
            await Promise.all([localRepos.repositories.save(repo), owner && localRepos.actors.save(owner)]);

            const localService = new ProxyService(httpClient, localRepos);

            const resources = [];
            const includesAll = opts.resources.includes('all');

            if (includesAll || opts.resources.includes(Stargazer.__collection_name))
              resources.push({ resource: Stargazer, repository: localRepos.stargazers });
            if (includesAll || opts.resources.includes(Tag.__collection_name))
              resources.push({ resource: Tag, repository: localRepos.tags });
            if (includesAll || opts.resources.includes(Release.__collection_name))
              resources.push({ resource: Release, repository: localRepos.releases });
            if (includesAll || opts.resources.includes(Watcher.__collection_name))
              resources.push({ resource: Watcher, repository: localRepos.watchers });
            if (includesAll || opts.resources.includes(Dependency.__collection_name))
              resources.push({ resource: Dependency, repository: localRepos.dependencies });

            const resourcesInfo = await Promise.all(
              resources.map(async (info) => {
                const [meta] = await localRepos.metadata.findByRepository(
                  repo.id,
                  info.resource.__collection_name as any,
                );
                const cachedCount = await info.repository.countByRepository(repo.id);
                const progressBar = opts.progress
                  ? multibar.create(get(repo, info.resource.__collection_name) || 0, cachedCount, {
                      resource: info.resource.__collection_name.padStart(14, ' '),
                    })
                  : undefined;

                return { resource: info.resource, endCursor: meta?.end_cursor, progressBar };
              }),
            );

            const iterator = localService.resources(repo.id, resourcesInfo);

            consola.info('Iterating over repository resources ...\n');
            while (true) {
              const { done, value } = await iterator.next();
              if (done) break;

              resourcesInfo.forEach((info, index) => {
                info.progressBar?.increment(value[index].items.length);
              });
            }
          });
        });
      });
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

exec().catch(consola.error);

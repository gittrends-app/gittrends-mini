import { MultiBar, Presets } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { get } from 'lodash';

import { Actor, ProxyService, Release, Stargazer, Tag } from '@gittrends/lib';

import { version } from './package.json';
import { ActorsRepository } from './repos/ActorRepository';
import { MetadataRepository } from './repos/MetadataRepository';
import { ReleasesRepository } from './repos/ReleasesRepository';
import { RepositoriesRepository } from './repos/RepositoriesRepository';
import { StargazersRepository } from './repos/StargazersRepository';
import { TagsRepository } from './repos/TagsRepository';
import { createOrConnectDatabase } from './sqlite.config';

type Repositories = {
  actors: ActorsRepository;
  repositories: RepositoriesRepository;
  stargazers: StargazersRepository;
  tags: TagsRepository;
  releases: ReleasesRepository;
  metadata: MetadataRepository;
};

async function withDatabase(
  db: string = 'repositories',
  context: (repos: Repositories) => Promise<void>,
): Promise<void> {
  const knex = await createOrConnectDatabase(db);

  await context({
    actors: new ActorsRepository(knex),
    repositories: new RepositoriesRepository(knex),
    stargazers: new StargazersRepository(knex),
    tags: new TagsRepository(knex),
    releases: new ReleasesRepository(knex),
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
    .addOption(new Option('-t, --token [string]', 'Github access token').env('TOKEN'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices([Stargazer.__collection_name, Tag.__collection_name, Release.__collection_name, 'all'])
        .default(['all']),
    )
    .action(async (name, opts: { token: string; resources: string[] }) => {
      consola.info('Opening local cache database ...');
      return withDatabase('repositories', async (globalRepos) => {
        const { actors: actorsRepo, repositories: reposRepo } = globalRepos;
        const globalService = new ProxyService(opts.token, globalRepos);

        consola.info(`Finding repository "${name}" ...`);
        const repo = await globalService.find(name);

        if (!repo) throw new Error('Repository not found!');
        const owner = repo.owner instanceof Actor ? repo.owner : await actorsRepo.findById(repo.owner);

        consola.info('Opening repository local database ...\n');
        return withDatabase(repo.name_with_owner, async (localRepos) => {
          await withMultibar(async (multibar) => {
            await Promise.all([localRepos.repositories.save(repo), owner && localRepos.actors.save(owner)]);

            const localService = new ProxyService(opts.token, localRepos);

            const resources = [];
            const includesAll = opts.resources.includes('all');

            if (includesAll || opts.resources.includes(Stargazer.__collection_name))
              resources.push({ resource: Stargazer, repository: localRepos.stargazers });
            if (includesAll || opts.resources.includes(Tag.__collection_name))
              resources.push({ resource: Tag, repository: localRepos.tags });
            if (includesAll || opts.resources.includes(Release.__collection_name))
              resources.push({ resource: Release, repository: localRepos.releases });

            const resourcesInfo = await Promise.all(
              resources.map(async (info) => {
                const [meta] = await localRepos.metadata.findByRepository(
                  repo.id,
                  info.resource.__collection_name as any,
                );
                const cachedCount = await info.repository.countByRepository(repo.id);
                const progressBar = multibar.create(get(repo, info.resource.__collection_name) || 0, cachedCount, {
                  resource: info.resource.__collection_name.padStart(11, ' '),
                });
                return { resource: info.resource, endCursor: meta?.end_cursor, progressBar };
              }),
            );

            const iterator = localService.resources(repo.id, resourcesInfo);

            consola.info('Iterating over repository resources ...');

            while (true) {
              const { done, value } = await iterator.next();
              if (done) break;

              resourcesInfo.forEach((info, index) => {
                info.progressBar.increment(value[index].items.length);
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

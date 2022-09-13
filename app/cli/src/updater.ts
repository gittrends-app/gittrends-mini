import { MultiBar, Presets } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola from 'consola';

import { Actor, ProxyService, Stargazer } from '@gittrends/lib';

import { version } from './package.json';
import { ActorsRepository } from './repos/ActorRepository';
import { MetadataRepository } from './repos/MetadataRepository';
import { RepositoriesRepository } from './repos/RepositoriesRepository';
import { StargazersRepository } from './repos/StargazersRepository';
import { createOrConnectDatabase } from './sqlite.config';

type Repositories = {
  actors: ActorsRepository;
  repositories: RepositoriesRepository;
  stargazers: StargazersRepository;
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
    metadata: new MetadataRepository(knex),
  }).finally(() => knex.destroy());
}

async function withMultibar(context: (multibar: MultiBar) => Promise<void>): Promise<void> {
  const multibar = new MultiBar(
    {
      format: '{resource} [{bar}] {duration_formatted} | {value}/{total} ({percentage}%)',
      clearOnComplete: true,
      hideCursor: true,
    },
    Presets.rect,
  );

  await context(multibar).finally(() => multibar.stop());
}

async function exec(args: string[] = process.argv, from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addArgument(new Argument('<repo>', 'Repository name with format <owner/name>'))
    .addOption(new Option('-t, --token [string]', 'Github access token').env('TOKEN'))
    .action(async (name, opts: { token: string }) => {
      consola.info('Opening local cache database ...');
      await withDatabase('repositories', async (globalRepos) => {
        const { actors: actorsRepo, repositories: reposRepo } = globalRepos;
        const globalService = new ProxyService(opts.token, globalRepos);

        consola.info(`Finding repository "${name}" ...`);
        const repo = await globalService.find(name);

        if (!repo) throw new Error('Repository not found!');
        const owner = repo.owner instanceof Actor ? repo.owner : await actorsRepo.findById(repo.owner);

        consola.info('Opening repository local database ...');
        return withDatabase(repo.name_with_owner, async (localRepos) => {
          await withMultibar(async (multibar) => {
            await Promise.all([localRepos.repositories.save(repo), owner && localRepos.actors.save(owner)]);

            const localService = new ProxyService(opts.token, localRepos);

            const resourcesInfo = await Promise.all(
              [{ resource: Stargazer, repository: localRepos.stargazers, metadata: 'stargazers' }].map(async (info) => {
                const [meta] = await localRepos.metadata.findByRepository(repo.id, info.metadata as any);
                const cachedCount = await info.repository.countByRepository(repo.id);
                const progressBar = multibar.create(repo.stargazers || 0, cachedCount, { resource: info.metadata });
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

exec().catch(console.error);

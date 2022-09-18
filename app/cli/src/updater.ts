import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { get } from 'lodash';
import { URL } from 'node:url';

import { Dependency, HttpClient, ProxyService, Release, Stargazer, Tag, Watcher } from '@gittrends/lib';

import { withDatabase } from './helpers/withDatabase';
import { withMultibar } from './helpers/withMultibar';
import { version } from './package.json';

export async function updater(
  name: string,
  opts: { token?: string; apiUrl?: string; resources: string[]; progress: boolean },
) {
  const apiURL = new URL((opts.token ? 'https://api.github.com' : opts.apiUrl) as string);
  const httpClient = new HttpClient({
    host: apiURL.hostname,
    protocol: apiURL.protocol.slice(0, -1),
    port: parseInt(apiURL.port),
    authToken: opts.token,
  });

  consola.info('Opening local cache database ...');
  const repo = await withDatabase(async (globalRepos) => {
    const globalService = new ProxyService(httpClient, globalRepos);
    consola.info(`Finding repository "${name}" ...`);
    return globalService.find(name);
  });

  if (!repo) throw new Error('Repository not found!');

  consola.info('Opening repository local database ...');
  await withDatabase(repo.name_with_owner, async (localRepos) => {
    await localRepos.repositories.save(repo);

    await withMultibar(async (multibar) => {
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
          const [meta] = await localRepos.metadata.findByRepository(repo.id, info.resource.__collection_name as any);
          const cachedCount = await info.repository.countByRepository(repo.id);
          const progressBar = opts.progress
            ? multibar.create(get(repo, info.resource.__collection_name, Infinity), cachedCount, {
                resource: info.resource.__collection_name.padStart(14, ' '),
              })
            : undefined;

          return { resource: info.resource, endCursor: meta?.end_cursor, progressBar };
        }),
      );

      const iterator = localService.resources(repo.id, resourcesInfo);

      consola.info('Iterating over repository resources ...\n');
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await iterator.next();
        if (done) break;

        resourcesInfo.forEach((info, index) => {
          info.progressBar?.increment(value[index].items.length);
        });
      }
    });
  });
}

async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
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
    .action(updater)
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

cli(process.argv).catch(consola.error);

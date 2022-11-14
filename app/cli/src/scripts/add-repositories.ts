import { map } from 'bluebird';
import { SingleBar } from 'cli-progress';
import { Argument, Command, Option, program } from 'commander';
import consola from 'consola';
import { chunk, flatten, isNil, orderBy, range, uniqBy } from 'lodash';

import { HttpClient } from '@gittrends/github';

import { GitHubService } from '@gittrends/service';

import { Repository } from '@gittrends/entities';

import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';

type FindOpts = {
  httpClient: HttpClient;
  limit: number;
  language: string;
  repository?: string;
  progressBar?: SingleBar;
  index?: number;
};

async function find(opts: FindOpts): Promise<Repository[]> {
  const iterator = new GitHubService(opts.httpClient).search({
    limit: opts.limit,
    language: opts.language,
    sort: 'stars',
    order: 'desc',
    minStargazers: 5,
    repo: opts.repository,
  });

  const repositories: Repository[] = [];
  for await (const [{ items }] of iterator) {
    repositories.push(...items);
    opts.progressBar?.update(repositories.length, { resource: 'search ' + (isNil(opts.index) ? '' : opts.index) });
  }

  return repositories;
}

async function multiFind(workers = 1, opts: FindOpts): Promise<Repository[]> {
  const results = await map(range(workers), (index) => find({ ...opts, index }));
  return orderBy(uniqBy(flatten(results), 'id'), 'stargazers', 'desc').slice(0, opts.limit);
}

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<Command> {
  return program
    .addOption(new Option('-l, --limit [number]', 'Max number of repositories').default(1000))
    .addOption(new Option('--language [string]', 'Search for repositories with programming language'))
    .addOption(new Option('--token [string]', 'Github access token').env('CLI_ACCESS_TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('CLI_API_URL').conflicts('token'))
    .addArgument(new Argument('[repo]', 'Find for specific repository'))
    .action(async (repo?: string, opts?: { limit: number; language: string; token?: string; apiUrl?: string }) => {
      if (!opts?.apiUrl && !opts?.token) throw new Error('--token or --api-url is mandatory!');

      consola.info('Preparing github client service...');
      const apiURL = new URL((opts.token ? 'https://api.github.com' : opts.apiUrl) as string);

      const httpClient = new HttpClient({
        host: apiURL.hostname,
        protocol: apiURL.protocol.slice(0, -1),
        port: parseInt(apiURL.port),
        authToken: opts.token,
      });

      const multibar = repo ? undefined : await withMultibar();

      consola.info('Opening local database...');
      await withDatabase({ name: 'public', migrate: true }, async ({ get: publicGet }) => {
        consola.info('Preparing progress bar...');

        const progressBar = multibar?.create(opts.limit, 0, { resource: 'search' });

        consola.info('Finding and persisting repositories...');
        const entityList = await multiFind(3, { httpClient, progressBar, repository: repo, ...opts });

        progressBar?.update(0, { resource: 'Persisting...' });

        for (const entityChunk of chunk(entityList, 25)) {
          await Promise.all(
            entityChunk.map((entity) =>
              withDatabase({ name: entity.name_with_owner, migrate: true }, ({ get }) =>
                Promise.all([publicGet(Repository).insert(entity), get(Repository).insert(entity)]),
              ).then(() => progressBar?.increment(1, { resource: entity.name_with_owner })),
            ),
          );
        }

        setTimeout(() => consola.success(`Done! ${entityList.length} repositories added.`), 1000);
      }).finally(() => multibar?.stop());
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from })
    .catch((error) => {
      consola.error(error);
      throw error;
    });
}

if (require.main === module) cli(process.argv);

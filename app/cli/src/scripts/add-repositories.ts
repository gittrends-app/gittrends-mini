import { Option, program } from 'commander';
import consola from 'consola';

import { GitHubService, HttpClient } from '@gittrends/lib';

import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addOption(new Option('-l, --limit [number]', 'Max number of repositories').default(1000))
    .addOption(new Option('--language [string]', 'Search for repositories with programming language'))
    .addOption(new Option('--token [string]', 'Github access token').env('TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('API_URL').conflicts('token'))
    .action(async (opts: { limit: number; language: string; token?: string; apiUrl?: string }) => {
      if (!opts.apiUrl && !opts.token) program.error('--token or --api-url is mandatory!');

      consola.info('Preparing github client service ...');
      const apiURL = new URL((opts.token ? 'https://api.github.com' : opts.apiUrl) as string);

      const httpClient = new HttpClient({
        host: apiURL.hostname,
        protocol: apiURL.protocol.slice(0, -1),
        port: parseInt(apiURL.port),
        authToken: opts.token,
      });

      const service = new GitHubService(httpClient);

      consola.info('Opening local database ...');
      await withDatabase(async ({ repositories }) => {
        const iterator = service.search({
          limit: opts.limit,
          language: opts.language,
          sort: 'stars',
          order: 'desc',
          minStargazers: 5,
        });

        await withMultibar(async (multibar) => {
          const progressBar = multibar.create(opts.limit, 0, { resource: 'repositories' });

          consola.info('Iterating over repositories ...\n');
          for await (const [{ items }] of iterator) {
            await repositories.save(items);
            progressBar.increment(items.length);
          }

          consola.success(`Done! ${progressBar.getProgress() * progressBar.getTotal()} repositories added.`);
        });
      });
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from })
    .catch((error) => {
      consola.error(error);
      throw error;
    });
}

cli(process.argv);

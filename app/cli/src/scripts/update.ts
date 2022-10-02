import { queue } from 'async';
import { MultiBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola, { WinstonReporter } from 'consola';
import { get } from 'lodash';
import { URL } from 'node:url';
import prettyjson from 'prettyjson';
import { LoggerOptions, format } from 'winston';
import { File } from 'winston/lib/winston/transports';

import {
  Dependency,
  HttpClient,
  Issue,
  ProxyService,
  PullRequest,
  Release,
  Stargazer,
  Tag,
  Watcher,
} from '@gittrends/lib';

import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';
import { schedule } from './schedule';
import { redisQueue } from './update-thread';

export const errorLogger = consola.create({
  reporters: [
    new WinstonReporter({
      format: format.combine(
        format.errors({ stack: true }),
        format.printf((info) => {
          const log = `${info.level}: ${info.message}`;
          return info.stack ? `${log}\n${info.stack}` : log;
        }),
      ),
      transports: [new File({ filename: 'update-error.log' })],
    } as LoggerOptions),
  ],
});

type UpdaterOpts = {
  httpClient: HttpClient;
  resources: string[];
  onProgress?: (progress: { current: number; total?: number }) => void;
};

export async function updater(name: string, opts: UpdaterOpts) {
  await withDatabase(name, async (localRepos) => {
    const localService = new ProxyService(opts.httpClient, localRepos);

    const repo = await localService.find(name, { noCache: true });
    if (!repo) throw new Error('Repository not found!');

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
    if (includesAll || opts.resources.includes(Issue.__collection_name))
      resources.push({ resource: Issue, repository: localRepos.issues });
    if (includesAll || opts.resources.includes(PullRequest.__collection_name))
      resources.push({ resource: PullRequest, repository: localRepos.pull_requests });

    const resourcesInfo = await Promise.all(
      resources.map(async (info) => {
        const [meta] = await localRepos.metadata.findByRepository(repo.id, info.resource.__collection_name as any);
        const cachedCount = await info.repository.countByRepository(repo.id);
        const total = get(repo, info.resource.__collection_name, 0);
        return { resource: info.resource, endCursor: meta?.end_cursor, total, cachedCount };
      }),
    );

    let current = resourcesInfo.reduce((acc, p) => acc + (p.total && p.cachedCount), 0);

    if (opts.onProgress) opts.onProgress({ current, total: resourcesInfo.reduce((acc, p) => acc + p.total, 0) });

    const iterator = localService.resources(repo.id, resourcesInfo, { ignoreCache: true });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await iterator.next();
      if (done) break;
      resourcesInfo.forEach((_, index) => (current += value[index].items.length));
      if (opts.onProgress) opts.onProgress({ current: (current += value.length) });
    }
  });
}

async function asyncQueue(
  names: string[],
  opts: { resources: string[]; concurrency: number; httpClient: HttpClient; multibar?: MultiBar },
) {
  consola.info('Preparing processing queue ....');
  const queueRef = queue(
    (name: string, callback) =>
      updater(name, { httpClient: opts.httpClient, resources: opts.resources })
        .then(() => callback())
        .catch((error) => {
          consola.error(error);
          opts.multibar?.log(error.message || JSON.stringify(error));
          errorLogger.error('Metadata: ' + JSON.stringify({ repository: name, resources: opts.resources }));
          errorLogger.error(error);
          callback(error);
        }),
    opts.concurrency,
  );

  consola.info('Pushing repositories to queue ....');
  queueRef.push(names);

  consola.info('Waiting process to finish ....\n');
  return queueRef.drain();
}

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addArgument(new Argument('[repo...]', 'Repository name with format <owner/name>'))
    .addOption(new Option('--token [string]', 'Github access token').env('CLI_ACCESS_TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('CLI_API_URL').conflicts('token'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices(
          [Stargazer, Tag, Release, Watcher, Dependency, Issue, PullRequest]
            .map((r) => r.__collection_name)
            .concat(['all']),
        )
        .default(['all']),
    )
    .addOption(new Option('--no-progress', 'Disable progress bars'))
    .addOption(new Option('--schedule', 'Schedule repositories before updating').default(false))
    .addOption(new Option('--concurrency [number]', 'Use paralled processing').default(1).argParser(Number))
    .addOption(new Option('--threads [number]', 'Use threads processing').default(1).argParser(Number))
    .action(
      async (
        names: string[],
        opts: {
          token?: string;
          apiUrl?: string;
          resources: string[];
          progress: boolean;
          schedule: boolean;
          concurrency: number;
          threads: number;
        },
      ) => {
        if (!opts.apiUrl && !opts.token) program.error('--token or --api-url is mandatory!');

        consola.info('Running updater with the following parameters: ');
        consola.log(`\n${prettyjson.render({ names, opts }, { inlineArrays: true })}\n`);

        const apiURL = new URL((opts.token ? 'https://api.github.com' : opts.apiUrl) as string);

        const httpClient = new HttpClient({
          host: apiURL.hostname,
          protocol: apiURL.protocol.slice(0, -1),
          port: parseInt(apiURL.port),
          authToken: opts.token,
          timeout: 60000,
          retries: 2,
        });

        await withMultibar(async (multibar) => {
          const processorOpts = { ...opts, httpClient, multibar: opts.progress ? multibar : undefined };
          if (names.length) {
            return asyncQueue(names, processorOpts);
          } else {
            if (opts.schedule) {
              consola.info('Scheduling repositories ...');
              await schedule(24);
            }
            consola.info('Processing repositories ...\n');
            return redisQueue(processorOpts);
          }
        });
      },
    )
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

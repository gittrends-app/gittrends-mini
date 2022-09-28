import { queue } from 'async';
import { MultiBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola, { WinstonReporter } from 'consola';
import { get, truncate } from 'lodash';
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

import { withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';
import { schedule } from './schedule';

const errorLogger = consola.create({
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
  multibar?: MultiBar;
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

    const progressBar = !opts.multibar
      ? undefined
      : opts.multibar.create(
          resourcesInfo.reduce((acc, p) => acc + p.total, 0),
          resourcesInfo.reduce((acc, p) => acc + (p.total && p.cachedCount), 0),
          { resource: truncate(repo.name_with_owner, { length: 28, omission: '..' }).padStart(30, ' ') },
        );

    const iterator = localService.resources(repo.id, resourcesInfo, { persistenceBatchSize: 500 });

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await iterator.next();
        if (done) break;

        resourcesInfo.forEach((_, index) => {
          progressBar?.increment(value[index].items.length);
        });
      }
    } catch (error) {
      errorLogger.error(error);
      throw error;
    } finally {
      if (progressBar) opts.multibar?.remove(progressBar);
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
      updater(name, { httpClient: opts.httpClient, resources: opts.resources, multibar: opts.multibar })
        .then(() => callback())
        .catch((error) => callback(error)),
    opts.concurrency,
  );

  consola.info('Pushing repositories to queue ....');
  queueRef.push(names);

  consola.info('Waiting process to finish ....\n');
  return queueRef.drain();
}

async function redisQueue(opts: { httpClient: HttpClient; concurrency: number; multibar?: MultiBar }) {
  await withBullQueue(async (queue) => {
    const counts = await queue.getJobCounts();
    const total = Object.values(counts).reduce((acc, v) => acc + v, 0);

    const generalProgress = opts.multibar?.create(total, counts.completed + counts.failed, {
      resource: truncate('[queue progress]', { length: 28, omission: '..' }).padStart(30, ' '),
    });

    const updateProgressBar = async () => {
      const counts = await queue.getJobCounts();
      generalProgress?.update(counts.completed + counts.failed);
      generalProgress?.setTotal(Object.values(counts).reduce((acc, v) => acc + v, 0));
    };

    queue.on('completed', updateProgressBar);
    queue.on('failed', updateProgressBar);
    queue.on('stalled', updateProgressBar);

    return queue
      .process('repositories', opts.concurrency, async (job) =>
        updater(job.id.toString(), { httpClient: opts.httpClient, multibar: opts.multibar, resources: ['all'] }).catch(
          (error: Error) => {
            opts.multibar?.log(error.message || JSON.stringify(error));
            throw error;
          },
        ),
      )
      .finally(() => generalProgress && opts.multibar?.remove(generalProgress));
  });
}

async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
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
    .addOption(new Option('--concurrency [number]', 'Use paralled processing').default(1))
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
          if (names.length) {
            return asyncQueue(names, {
              ...opts,
              httpClient,
              multibar: opts.progress ? multibar : undefined,
            });
          } else {
            if (opts.schedule) {
              consola.info('Scheduling repositories ...');
              await schedule(24);
            }
            consola.info('Processing repositories ...\n');
            return redisQueue({
              httpClient,
              concurrency: opts.concurrency,
              multibar: opts.progress ? multibar : undefined,
            });
          }
        });
      },
    )
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

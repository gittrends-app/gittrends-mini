import { queue } from 'async';
import { Queue, QueueEvents } from 'bullmq';
import { MultiBar, SingleBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola, { WinstonReporter } from 'consola';
import { get, isNil, omitBy, pick, size, sum, truncate, values } from 'lodash';
import path, { extname } from 'node:path';
import readline from 'node:readline';
import { clearInterval } from 'node:timers';
import { URL } from 'node:url';
import { Worker } from 'node:worker_threads';
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

import { withBullEvents, withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';
import { schedule } from './schedule';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

process.stdin.on('keypress', (chunk, key) => {
  if (key && key.name === 'c' && key.ctrl === true) process.exit();
});

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
    let writeBatchSize: Record<string, number | undefined> = {};

    if (includesAll || opts.resources.includes(Stargazer.__collection_name)) {
      resources.push({ resource: Stargazer, repository: localRepos.stargazers });
      writeBatchSize[Stargazer.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Stargazer.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(Tag.__collection_name)) {
      resources.push({ resource: Tag, repository: localRepos.tags });
      writeBatchSize[Tag.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Tag.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(Release.__collection_name)) {
      resources.push({ resource: Release, repository: localRepos.releases });
      writeBatchSize[Release.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Release.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(Watcher.__collection_name)) {
      resources.push({ resource: Watcher, repository: localRepos.watchers });
      writeBatchSize[Watcher.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Watcher.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(Dependency.__collection_name)) {
      resources.push({ resource: Dependency, repository: localRepos.dependencies });
      writeBatchSize[Dependency.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Dependency.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(Issue.__collection_name)) {
      resources.push({ resource: Issue, repository: localRepos.issues });
      writeBatchSize[Issue.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Issue.__collection_name}`.toUpperCase()] || '') || undefined;
    }
    if (includesAll || opts.resources.includes(PullRequest.__collection_name)) {
      resources.push({ resource: PullRequest, repository: localRepos.pull_requests });
      writeBatchSize[PullRequest.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${PullRequest.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    writeBatchSize = omitBy(writeBatchSize, isNil);

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

    const iterator = localService.resources(repo.id, resourcesInfo, {
      ignoreCache: true,
      persistenceBatchSize: size(writeBatchSize)
        ? (writeBatchSize as Record<string, number>)
        : parseInt(process.env.CLI_WRITE_BATCH || '') || undefined,
    });

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
  opts: { resources: string[]; workers: number; httpClient: HttpClient; multibar?: MultiBar },
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
    opts.workers,
  );

  consola.info('Pushing repositories to queue ....');
  queueRef.push(names);

  consola.info('Waiting process to finish ....\n');
  return queueRef.drain();
}

export async function redisQueue(opts: {
  resources: string[];
  httpClient: HttpClient;
  workers: number;
  threads?: number;
  multibar?: MultiBar;
}) {
  const threadsConcurrency: number[] = Array.from(Array(opts.threads || 1)).fill(opts.workers);

  let queue: Queue | undefined;
  let queueEvents: QueueEvents | undefined;

  if (opts.multibar) {
    const generalProgress = opts.multibar.create(Infinity, 0);

    withBullQueue<void>(async (_queue) => {
      queue = _queue;
      await withBullEvents<void>(async (_eventsQueue) => {
        queueEvents = _eventsQueue;

        const updateGeneralProgress = async () => {
          const counts = await queue?.getJobCounts();
          generalProgress.setTotal(sum(values(counts)));
          const failedPrefix = counts?.failed ? ` (${counts?.failed} failed)` : '';
          generalProgress.update(sum(values(pick(counts, ['completed', 'failed']))), {
            resource: `Finished jobs ${failedPrefix}`.padEnd(35, ' '),
          });
        };

        queueEvents.on('completed', updateGeneralProgress);
        queueEvents.on('error', updateGeneralProgress);

        updateGeneralProgress();

        return new Promise((resolve) => queue?.on('ioredis:close', resolve));
      });
    }).finally(() => opts.multibar?.remove(generalProgress));
  }

  const createWorker = (
    concurrency: number,
    index: number,
  ): { worker: Worker; closed: boolean; progressBar?: SingleBar } => {
    const workerFile = path.resolve(__dirname, `update-thread${extname(__filename)}`);
    const worker = new Worker(workerFile, {
      workerData: {
        concurrency: concurrency,
        resources: opts.resources,
        httpClientOpts: opts.httpClient.toJSON(),
      },
    });

    const totals: Record<string, number> = {};
    const progressBar: SingleBar | undefined = opts.multibar?.create(Infinity, 0);

    worker.on(
      'message',
      (progress: { event: 'started' | 'updated' | 'finished'; name: string; current: number; total?: number }) => {
        if (!opts.multibar || !progressBar) return;
        const name = `<thd${index + 1}> ${progress.name}`;
        const resource = truncate(name, { length: 25, omission: '..' }).padEnd(35, ' ');
        switch (progress.event) {
          case 'started':
            progressBar.update(0, { resource });
            break;
          case 'updated':
            if (progress.total) totals[progress.name] = progress.total;
            progressBar.setTotal(totals[progress.name]);
            progressBar.update(progress.current, { resource });
            queue
              ?.getJob(progress.name)
              .then((job) => job?.updateProgress((progress.current / totals[progress.name]) * 100));
            break;
        }
      },
    );

    return { worker, closed: false, progressBar };
  };

  const threads = threadsConcurrency.map((workers, index) => createWorker(workers, index));

  process.stdin.on('keypress', (chunk, key) => {
    if (!key) return;
    if (key.sequence === '+') {
      threads.push(createWorker(opts.workers, threads.length));
    } else if (key.sequence === '-') {
      for (const thread of threads.reverse()) {
        if (!thread.closed) {
          if (thread.progressBar) opts.multibar?.remove(thread.progressBar);
          thread.worker.terminate().finally(() => (thread.closed = true));
          break;
        }
      }
    }
  });

  let interval: ReturnType<typeof setInterval>;
  await new Promise<void>((resolve) => {
    interval = setInterval(() => (threads.every((t) => t.closed) ? resolve() : null), 500);
  })
    .finally(() => Promise.all([queue?.close(), queueEvents?.close()]))
    .finally(() => clearInterval(interval));
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
    .addOption(new Option('--workers [number]', 'Number of workers per thread').default(1).argParser(Number))
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
          workers: number;
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
    .parseAsync(args, { from })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

if (require.main === module) cli(process.argv);

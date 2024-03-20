import { queue } from 'async';
import { Queue, QueueEvents } from 'bullmq';
import { MultiBar, SingleBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { pick, sum, values } from 'lodash';
import path, { extname } from 'node:path';
import readline from 'node:readline';
import { clearInterval } from 'node:timers';
import { URL } from 'node:url';
import { Worker } from 'node:worker_threads';
import prettyjson from 'prettyjson';
import { createLogger, format } from 'winston';
import { Console, File } from 'winston/lib/winston/transports';

import { HttpClient } from '@gittrends/github';

import { CachedService, GitHubService, PersistenceService } from '@gittrends/service';

import { withBullEvents, withBullQueue } from '../../helpers/withBullQueue';
import { withCache } from '../../helpers/withCache';
import { withDatabase } from '../../helpers/withDatabase';
import { withMultibar } from '../../helpers/withMultibar';
import { version } from '../../package.json';
import { schedule } from '../schedule';
import { actorsUpdater } from './update-worker';
import { updater } from './update-worker';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

process.stdin.on('keypress', (chunk, key) => {
  if (key && key.name === 'c' && key.ctrl === true) process.exit();
});

const IS_SINGLE_SCHEMA = process.env.CLI_USE_SINGLE_SCHEMA === 'true';

export const errorLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.errors({ stack: true }),
    format.printf(
      (info) =>
        (info.meta ? `Metadata: ${JSON.stringify(info.meta)}\n` : '') +
        (info.stack ? `${info.level}: ${info.stack}` : `${info.level}: ${info.message}`),
    ),
  ),
  transports: [new File({ filename: 'update-error.log' }), new Console({ log: (error) => consola.error(error) })],
});

async function asyncQueue(
  names: string[],
  opts: {
    resources: Parameters<typeof updater>[1]['resources'];
    workers: number;
    httpClient: HttpClient;
    multibar?: MultiBar;
  },
) {
  consola.info('Preparing processing queue ....');
  const service = new CachedService(new GitHubService(opts.httpClient), withCache());

  const queueRef = queue(
    (name: string, callback) =>
      updater(name, {
        service,
        resources: opts.resources,
        before: new Date(),
        iterationsToPersist: parseInt(`${process.env.CLI_UPDATER_ITERATIONS || 3}`),
      })
        .then(() => callback())
        .catch((error) => {
          opts.multibar?.log(error.message || JSON.stringify(error));
          errorLogger.error(Object.assign(error, { meta: { repository: name, resources: opts.resources } }));
          callback(error);
        }),
    opts.workers,
  );

  consola.info('Pushing repositories to queue ....');
  queueRef.push(names);

  consola.info('Waiting process to finish ....');
  await queueRef.drain();

  consola.info(`Update process finished (${names.length} repositories updated)`);
}

export async function redisQueue(opts: {
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
            resource: `Finished jobs ${failedPrefix}`,
          });
        };

        queueEvents.on('completed', updateGeneralProgress);
        queueEvents.on('failed', updateGeneralProgress);
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
        cacheSize: parseInt(process.env.CACHE_SIZE || '100000'),
        concurrency: concurrency,
        httpClientOpts: opts.httpClient.toJSON(),
        updateActors: !IS_SINGLE_SCHEMA,
      },
    });

    const totals: Record<string, number> = {};
    const progressBar: SingleBar | undefined = opts.multibar?.create(Infinity, 0);

    worker.on(
      'message',
      (progress: { event: 'started' | 'updated' | 'finished'; name: string; current: number; total?: number }) => {
        if (!opts.multibar || !progressBar) return;
        const name = `<thd${index + 1}> ${progress.name}`;
        switch (progress.event) {
          case 'started':
            progressBar.update(0, { resource: name });
            break;
          case 'updated':
            if (progress.total) totals[progress.name] = progress.total;
            progressBar.setTotal(totals[progress.name]);
            progressBar.update(progress.current, { resource: name });
            queue
              ?.getJob(progress.name)
              .then((job) => job?.updateProgress(Math.round((progress.current / totals[progress.name]) * 100)));
            break;
        }
      },
    );

    return { worker, closed: false, progressBar };
  };

  const threads = threadsConcurrency.map((workers, index) => createWorker(workers, index));

  if (IS_SINGLE_SCHEMA) {
    const progressBar: SingleBar | undefined = opts.multibar?.create(Infinity, 0);

    do {
      await withDatabase(async (db) =>
        actorsUpdater({
          knex: db.knex,
          service: new PersistenceService(new CachedService(new GitHubService(opts.httpClient), withCache()), db),
          concurrency: opts.workers,
          before: new Date(),
          onUpdate: (progress) => {
            progressBar?.setTotal(progress.total);
            progressBar?.update(progress.current, { resource: '<actors>' });
          },
        }),
      );
    } while (threads.some((thread) => !thread.closed));
  }

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
  type CliOptions = {
    token?: string;
    apiUrl?: string;
    resources: Parameters<typeof updater>[1]['resources'];
    progress: boolean;
    schedule: boolean;
    workers: number;
    threads: number;
  };

  const defaultResources: CliOptions['resources'] = [
    'actors',
    'dependencies',
    'issues',
    'pull_requests',
    'releases',
    'stargazers',
    'tags',
    'watchers',
  ] as const;

  await program
    .addArgument(new Argument('[repo...]', 'Repository name with format <owner/name>'))
    .addOption(new Option('--token [string]', 'Github access token').env('CLI_ACCESS_TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('CLI_API_URL').conflicts('token'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices(defaultResources)
        .default(defaultResources),
    )
    .addOption(new Option('--no-progress', 'Disable progress bars'))
    .addOption(new Option('--schedule', 'Schedule repositories before updating'))
    .addOption(new Option('--workers [number]', 'Number of workers per thread').default(1).argParser(Number))
    .addOption(new Option('--threads [number]', 'Use threads processing').default(1).argParser(Number))
    .action(async (names: string[], opts: CliOptions) => {
      const interval = setInterval(() => globalThis.gc && globalThis.gc(), 5000);

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
        const processorOpts = {
          ...opts,
          resources: opts.resources,
          httpClient,
          multibar: opts.progress ? multibar : undefined,
        };

        if (names.length) {
          return asyncQueue(names, processorOpts);
        } else {
          if (opts.schedule) {
            consola.info('Scheduling repositories ...');
            await schedule({ wait: 24 });
          }
          consola.info('Processing repositories ...\n');
          return redisQueue(processorOpts);
        }
      });

      clearInterval(interval);
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

if (require.main === module) cli(process.argv);

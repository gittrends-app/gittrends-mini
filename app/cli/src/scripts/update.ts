import { queue } from 'async';
import { mapSeries } from 'bluebird';
import { Queue, QueueEvents } from 'bullmq';
import { MultiBar, SingleBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola, { WinstonReporter } from 'consola';
import { chunk, compact, get, isNil, omitBy, pick, size, sum, values } from 'lodash';
import path, { extname } from 'node:path';
import readline from 'node:readline';
import { clearInterval } from 'node:timers';
import { URL } from 'node:url';
import { Worker } from 'node:worker_threads';
import prettyjson from 'prettyjson';
import { LoggerOptions, format } from 'winston';
import { File } from 'winston/lib/winston/transports';

import { HttpClient } from '@gittrends/github';

import { ProxyService } from '@gittrends/service';

import { Actor, Dependency, Issue, PullRequest, Release, Stargazer, Tag, Watcher } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { withBullEvents, withBullQueue } from '../helpers/withBullQueue';
import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';
import { schedule } from './schedule';

const logger = debug('cli:update');

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

export type UpdatableResource =
  | typeof Stargazer
  | typeof Tag
  | typeof Release
  | typeof Watcher
  | typeof Dependency
  | typeof Issue
  | typeof PullRequest
  | typeof Actor;

export const UpdatebleResourcesList = [Stargazer, Tag, Release, Watcher, Dependency, Issue, PullRequest, Actor];

type ResourceProgress = Record<string, { done: boolean; current: number; total: number }>;

type UpdaterOpts = {
  httpClient: HttpClient;
  resources: UpdatableResource[];
  onProgress?: (progress: ResourceProgress) => void;
};

export async function updater(name: string, opts: UpdaterOpts) {
  logger(`Starting updater for ${name} (resources: ${opts.resources.join(', ')})`);
  return withDatabase(name, async (localRepos) => {
    const localService = new ProxyService(opts.httpClient, localRepos);

    logger('Finding repository localy...');
    let repo = await localRepos.repositories.findByName(name);
    if (!repo) throw new Error(`Database corrupted! Repository ${name} not found!`);

    logger('Updating repository data from github...');
    repo = await localService.get(repo.id, { noCache: true });
    if (!repo) throw new Error(`Repository ${name} not found!`);

    logger('Updating local data...');
    await withDatabase('public', ({ repositories }) => (repo ? repositories.save(repo) : Promise.reject()));

    logger('Preparing resources metadata...');
    let writeBatchSize: Record<string, number | undefined> = {};

    const resources = [];

    if (opts.resources.includes(Stargazer)) {
      resources.push({ resource: Stargazer, repository: localRepos.stargazers });
      writeBatchSize[Stargazer.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Stargazer.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(Tag)) {
      resources.push({ resource: Tag, repository: localRepos.tags });
      writeBatchSize[Tag.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Tag.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(Release)) {
      resources.push({ resource: Release, repository: localRepos.releases });
      writeBatchSize[Release.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Release.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(Watcher)) {
      resources.push({ resource: Watcher, repository: localRepos.watchers });
      writeBatchSize[Watcher.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Watcher.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(Dependency)) {
      resources.push({ resource: Dependency, repository: localRepos.dependencies });
      writeBatchSize[Dependency.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Dependency.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(Issue)) {
      resources.push({ resource: Issue, repository: localRepos.issues });
      writeBatchSize[Issue.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${Issue.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    if (opts.resources.includes(PullRequest)) {
      resources.push({ resource: PullRequest, repository: localRepos.pull_requests });
      writeBatchSize[PullRequest.__collection_name] =
        parseInt(process.env[`CLI_WRITE_BATCH_${PullRequest.__collection_name}`.toUpperCase()] || '') || undefined;
    }

    let actorsIds: Array<{ id: string }> | undefined;
    if (opts.resources.includes(Actor)) {
      logger('Finding for not updated actors...');
      actorsIds = await localRepos.knex.select('id').from(Actor.__collection_name).whereNull('__updated_at');
    }

    writeBatchSize = omitBy(writeBatchSize, isNil);

    logger('Getting resources metadata...');
    const repoResourcesInfo = await mapSeries(resources, async (info) => {
      const [meta] = await localRepos.metadata.findByRepository(
        repo?.id as string,
        info.resource.__collection_name as any,
      );
      const cachedCount = await info.repository.countByRepository(repo?.id as string);
      const total = get(repo, info.resource.__collection_name, 0);
      return { resource: info.resource, done: false, current: cachedCount, total, endCursor: meta?.end_cursor };
    });

    const usersResourceInfo = { resource: Actor, done: false, current: 0, total: actorsIds?.length || 0 };

    const reportCurrentProgress = function () {
      if (!opts.onProgress) return;

      return opts.onProgress(
        [...repoResourcesInfo, usersResourceInfo].reduce(
          (progress, { resource, ...info }) => ({ ...progress, [resource.__collection_name]: info }),
          {},
        ),
      );
    };

    const iterator = localService.resources(repo.id, repoResourcesInfo, {
      ignoreCache: true,
      persistenceBatchSize: size(writeBatchSize)
        ? (writeBatchSize as Record<string, number>)
        : parseInt(process.env.CLI_WRITE_BATCH || '') || undefined,
    });

    const actorsUpdatePromise = withDatabase('public', async (publicActorsRepos) => {
      if (!actorsIds?.length) return;
      const chunkSize = parseInt(process.env.CLI_WRITE_BATCH_ACTORS || '100');
      const actorsProxy = new ProxyService(opts.httpClient, publicActorsRepos);
      for (const [index, iChunk] of chunk(actorsIds, chunkSize).entries()) {
        logger(`Updating ${iChunk.length * index + iChunk.length} (of ${actorsIds.length}) actors...`);
        try {
          const ids = iChunk.map((i) => i.id);
          await localRepos.actors.upsert(await actorsProxy.getActor(ids).then(compact));
        } finally {
          usersResourceInfo.current += iChunk.length;
          reportCurrentProgress();
        }
      }
      usersResourceInfo.done = true;
      reportCurrentProgress();
      logger(`${actorsIds.length} actors updated...`);
    });

    const resourcesUpdatePromise = new Promise<void>((resolve, reject) =>
      (async () => {
        logger('Iterating over resources...');
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await iterator.next();
          if (done) break;
          repoResourcesInfo.forEach((info, index) => {
            info.done = !value[index].hasNextPage;
            info.current += value[index].items.length;
          });
          reportCurrentProgress();
        }
      })()
        .then(resolve)
        .catch(reject),
    );

    logger('Waiting update process to finish...');
    return Promise.all([actorsUpdatePromise, resourcesUpdatePromise]);
  });
}

async function asyncQueue(
  names: string[],
  opts: { resources: UpdatableResource[]; workers: number; httpClient: HttpClient; multibar?: MultiBar },
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
        concurrency: concurrency,
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
    resources: UpdatableResource[];
    progress: boolean;
    schedule: boolean;
    workers: number;
    threads: number;
  };

  await program
    .addArgument(new Argument('[repo...]', 'Repository name with format <owner/name>'))
    .addOption(new Option('--token [string]', 'Github access token').env('CLI_ACCESS_TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('CLI_API_URL').conflicts('token'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices(UpdatebleResourcesList.map((r) => r.__collection_name))
        .argParser<Partial<typeof UpdatebleResourcesList>>((value, resources) =>
          compact([...(resources || []), UpdatebleResourcesList.find((ur) => ur.__collection_name === value)]),
        )
        .default([]),
    )
    .addOption(new Option('--no-progress', 'Disable progress bars'))
    .addOption(new Option('--schedule', 'Schedule repositories before updating').default(false))
    .addOption(new Option('--workers [number]', 'Number of workers per thread').default(1).argParser(Number))
    .addOption(new Option('--threads [number]', 'Use threads processing').default(1).argParser(Number))
    .action(async (names: string[], opts: CliOptions) => {
      if (!opts.apiUrl && !opts.token) program.error('--token or --api-url is mandatory!');

      consola.info('Running updater with the following parameters: ');
      consola.log(
        `\n${prettyjson.render(
          { names, opts: { ...opts, resources: opts.resources.map((r) => r.__collection_name) } },
          { inlineArrays: true },
        )}\n`,
      );

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
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

if (require.main === module) cli(process.argv);

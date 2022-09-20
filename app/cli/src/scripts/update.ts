import { queue } from 'async';
import { each } from 'bluebird';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { MultiBar } from 'cli-progress';
import { Argument, Option, program } from 'commander';
import consola from 'consola';
import { get, truncate } from 'lodash';
import { URL } from 'node:url';
import prettyjson from 'prettyjson';

import { Dependency, HttpClient, ProxyService, Release, Stargazer, Tag, Watcher } from '@gittrends/lib';

import { createEvents, createQueue, createWorker } from '../config/bullmq.config';
import { withDatabase } from '../helpers/withDatabase';
import { withMultibar } from '../helpers/withMultibar';
import { version } from '../package.json';
import { schedule } from './schedule';

type UpdaterOpts = {
  httpClient: HttpClient;
  resources: string[];
  multibar?: MultiBar;
};

export async function updater(name: string, opts: UpdaterOpts) {
  const repo = await withDatabase(async (globalRepos) => {
    const globalService = new ProxyService(opts.httpClient, globalRepos);
    return globalService.find(name);
  });

  if (!repo) throw new Error('Repository not found!');

  await withDatabase(repo.name_with_owner, async (localRepos) => {
    const localService = new ProxyService(opts.httpClient, localRepos);

    const updatedRepo = await localService.find(repo.name_with_owner, { noCache: true });
    if (!updatedRepo) throw new Error('Repository not found!');

    await withDatabase(({ repositories }) => repositories.save(updatedRepo));

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
        const [meta] = await localRepos.metadata.findByRepository(
          updatedRepo.id,
          info.resource.__collection_name as any,
        );
        const cachedCount = await info.repository.countByRepository(updatedRepo.id);
        const total = get(updatedRepo, info.resource.__collection_name, 0);
        return { resource: info.resource, endCursor: meta?.end_cursor, total, cachedCount };
      }),
    );

    const progressBar = !opts.multibar
      ? undefined
      : opts.multibar.create(
          resourcesInfo.reduce((acc, p) => acc + p.total, 0),
          resourcesInfo.reduce((acc, p) => acc + p.cachedCount, 0),
          { resource: truncate(updatedRepo.name_with_owner, { length: 28, omission: '..' }).padStart(30, ' ') },
        );

    const iterator = localService.resources(updatedRepo.id, resourcesInfo);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await iterator.next();
      if (done) break;

      resourcesInfo.forEach((_, index) => {
        progressBar?.increment(value[index].items.length);
      });
    }
  });
}

async function asyncQueue(names: string[], opts: { resources: string[]; concurrency: number; httpClient: HttpClient }) {
  return withMultibar(async (multibar) => {
    consola.info('Preparing processing queue ....');
    const queueRef = queue(
      (name: string) => updater(name, { httpClient: opts.httpClient, resources: opts.resources, multibar }),
      opts.concurrency,
    );

    consola.info('Pushing repositories to queue ....');
    queueRef.push(names);

    consola.info('Waiting process to finish ....\n');
    return queueRef.drain();
  });
}

async function redisQueue(opts: { httpClient: HttpClient; concurrency: number }) {
  let queue: Queue, events: QueueEvents, worker: Worker;

  return withMultibar(async (multibar) => {
    queue = createQueue();

    const counts = await queue.getJobCounts();
    const total = Object.values(counts).reduce((acc, v) => acc + v, 0);
    const start = total - (counts.waiting || 0);

    const queueProgressBar = multibar.create(total, start, {
      resource: truncate('Redis Queue', { length: 28, omission: '..' }).padStart(30, ' '),
    });

    const eventHandler = async () => {
      const counts = await queue.getJobCounts();
      const total = Object.values(counts).reduce((acc, v) => acc + v, 0);
      const progress = total - (counts.waiting || 0);
      queueProgressBar.update(progress);
    };

    events = createEvents();
    events.on('completed', eventHandler);
    events.on('failed', eventHandler);

    worker = createWorker(
      async (job) =>
        updater(job.data.name_with_owner, { httpClient: opts.httpClient, multibar, resources: ['all'] }).catch(
          (error) => {
            consola.error(error);
            throw error;
          },
        ),
      { concurrency: opts.concurrency },
    );

    return new Promise<void>((resolve) => worker.on('closed', resolve));
  }).finally(() => each([queue, events, queue], (q) => q && q.close()));
}

async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addArgument(new Argument('[repo...]', 'Repository name with format <owner/name>'))
    .addOption(new Option('--token [string]', 'Github access token').env('TOKEN').conflicts('api-url'))
    .addOption(new Option('--api-url [string]', 'URL of the target API').env('API_URL').conflicts('token'))
    .addOption(
      new Option('-r, --resources [string...]', 'Resources to update')
        .choices([Stargazer, Tag, Release, Watcher, Dependency].map((r) => r.__collection_name).concat(['all']))
        .default(['all']),
    )
    .addOption(new Option('--no-progress', 'Disable progress bars'))
    .addOption(new Option('--concurrency [number]', 'Use paralled processing').default(1))
    .action(
      async (
        names: string[],
        opts: { token?: string; apiUrl?: string; resources: string[]; progress: boolean; concurrency: number },
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
        });

        if (names.length) {
          return asyncQueue(names, { ...opts, httpClient });
        } else {
          consola.info('Scheduling repositories ...');
          await schedule(24);
          consola.info('Processing repositories ...\n');
          return redisQueue({ httpClient, concurrency: opts.concurrency });
        }
      },
    )
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

import consola from 'consola';
import { compact, pickBy } from 'lodash';
import { isMainThread, parentPort, threadId, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/github';

import { CachedService, GitHubService } from '@gittrends/service';

import { debug } from '@gittrends/helpers';

import { withBullWorker } from '../../helpers/withBullQueue';
import { withDatabaseCache, withMemoryCache } from '../../helpers/withCache';
import { UpdatableResource, UpdatebleResourcesList } from './index';
import { updater } from './update-worker';

export const logger = debug('cli:update-thread');

async function workerThread(): Promise<void> {
  const cliEnvironment = pickBy(process.env, (_, key) => key.startsWith('CLI_') || ['DEBUG', 'NODE_ENV'].includes(key));

  logger(`Thread ${threadId} data: ${JSON.stringify(workerData)}`);
  logger(`Thread ${threadId} environment: ${JSON.stringify(cliEnvironment)}`);

  const service = new CachedService(
    new CachedService(new GitHubService(new HttpClient(workerData.httpClientOpts)), await withDatabaseCache()),
    withMemoryCache(),
  );

  const worker = withBullWorker(async (job) => {
    if (!job.data.name_with_owner) throw new Error('Invlaid job id!');

    parentPort?.postMessage({ event: 'started', name: job.data.name_with_owner });

    const resources = compact(
      job.data.__resources.map((r) => UpdatebleResourcesList.find((ur) => ur.__collection_name === r)),
    ) as UpdatableResource[];

    return updater(job.data.name_with_owner, {
      resources: resources,
      service,
      before: new Date(job.data.__updated_before),
      onProgress: async (progress) => {
        const [current, total] = Object.values(progress).reduce(
          ([current, total], rp) =>
            rp.total === Infinity ? [current, total] : [current + rp.current, total + rp.total],
          [0, 0],
        );

        parentPort?.postMessage({ event: 'updated', name: job.data.name_with_owner, current, total });

        await job.updateProgress(progress);
      },
    })
      .catch((error: Error) => {
        parentPort?.postMessage({ event: 'error', name: job.data.name_with_owner, message: error.message });
        throw error;
      })
      .finally(() => {
        if (globalThis.gc) globalThis.gc();
        parentPort?.postMessage({ event: 'finished', name: job.data.name_with_owner });
      });
  }, workerData.concurrency);

  worker.on('closed', () => consola.info('Connection closed'));
  worker.on('error', consola.error);

  parentPort?.on('message', (data) => {
    if (data.concurrency) worker.concurrency = data.concurrency;
    else logger(`Unknown message: ${JSON.stringify(data)}`);
  });
}

if (!isMainThread) workerThread();

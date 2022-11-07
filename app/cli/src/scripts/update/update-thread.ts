import { compact, pickBy, round } from 'lodash';
import { isMainThread, parentPort, threadId, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/github';

import { Entity } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { withBullWorker } from '../../helpers/withBullQueue';
import { UpdatableResource, UpdatebleResourcesList } from './index';
import { updater } from './update-worker';

export const logger = debug('cli:update-thread');

function objectToString(object: Record<string, any>) {
  return Object.keys(object)
    .map((key) => `${key}: ${object[key]}`)
    .join(', ');
}

if (!isMainThread) {
  const cliEnvironment = pickBy(process.env, (_, key) => key.startsWith('CLI_') || ['DEBUG', 'NODE_ENV'].includes(key));

  logger(`Thread ${threadId} data: ${JSON.stringify(workerData)}`);
  logger(`Thread ${threadId} environment: ${JSON.stringify(cliEnvironment)}`);

  const httpClient = new HttpClient(workerData.httpClientOpts);

  const worker = withBullWorker(async (job) => {
    if (!job.data.name_with_owner) throw new Error('Invlaid job id!');

    parentPort?.postMessage({ event: 'started', name: job.data.name_with_owner });

    const resources = compact(
      job.data.pending_resources.map((r) => UpdatebleResourcesList.find((ur) => ur.__collection_name === r)),
    ) as (typeof Entity & ThisType<UpdatableResource>)[];

    await updater(job.data.name_with_owner, {
      httpClient: httpClient,
      resources: resources,
      onProgress: async (progress) => {
        const [current, total] = Object.values(progress).reduce(
          ([current, total], rp) => [current + rp.current, total + rp.total],
          [0, 0],
        );

        parentPort?.postMessage({ event: 'updated', name: job.data.name_with_owner, current, total });

        const finishedResources = compact(
          Object.keys(progress).map((resource) =>
            job.data.pending_resources.includes(resource) && progress[resource].done ? resource : undefined,
          ),
        );

        await Promise.all([
          job.updateProgress(round((current / total) * 100, 1)),
          job.update({
            ...job.data,
            updated_resources: (job.data.updated_resources || []).concat(
              Object.keys(progress).filter((res) => progress[res].done),
            ),
            pending_resources: Object.keys(progress).filter((res) => !progress[res].done),
          }),
          ...finishedResources.map((resource) =>
            job.log(`${Date.now()} | ${resource} -> ${objectToString(progress[resource])}`),
          ),
        ]);
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

  worker.on('closed', () => logger('Connection closed'));

  parentPort?.on('message', (data) => {
    if (data.concurrency) worker.concurrency = data.concurrency;
    else logger(`Unknown message: ${JSON.stringify(data)}`);
  });
}

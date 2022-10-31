import { compact, round } from 'lodash';
import { isMainThread, parentPort, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/github';

import { withBullWorker } from '../helpers/withBullQueue';
import { UpdatebleResourcesList, errorLogger, updater } from './update';

function objectToString(object: Record<string, any>) {
  return Object.keys(object)
    .map((key) => `${key}: ${object[key]}`)
    .join(', ');
}

if (!isMainThread) {
  const httpClient = new HttpClient(workerData.httpClientOpts);

  withBullWorker(async (job) => {
    if (!job.data.name_with_owner) throw new Error('Invlaid job id!');

    parentPort?.postMessage({ event: 'started', name: job.data.name_with_owner });

    const resources = compact(
      job.data.pending_resources.map((r) => UpdatebleResourcesList.find((ur) => ur.__collection_name === r)),
    );

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
            updated_resources: Object.keys(progress).filter((res) => progress[res].done),
            pending_resources: Object.keys(progress).filter((res) => !progress[res].done),
          }),
          ...finishedResources.map((resource) =>
            job.log(`${Date.now()} | ${resource} -> ${objectToString(progress[resource])}`),
          ),
        ]);
      },
    })
      .catch((error: Error) => {
        errorLogger.error('Metadata: ' + JSON.stringify({ repository: job.data.id, resources: workerData.resources }));
        errorLogger.error(error);
        throw error;
      })
      .finally(() => {
        if (globalThis.gc) globalThis.gc();
        parentPort?.postMessage({ event: 'finished', name: job.data.name_with_owner });
      });
  }, workerData.concurrency);
}

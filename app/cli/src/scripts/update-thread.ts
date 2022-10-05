import { isMainThread, parentPort, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/lib';

import { withBullWorker } from '../helpers/withBullQueue';
import { errorLogger, updater } from './update';

if (!isMainThread) {
  withBullWorker(async (job) => {
    if (!job.data.name_with_owner) throw new Error('Invlaid job:id!');

    parentPort?.postMessage({ event: 'started', name: job.data.name_with_owner });
    return updater(job.data.name_with_owner, {
      httpClient: new HttpClient(workerData.httpClientOpts),
      resources: workerData.resources,
      onProgress: (progress) =>
        parentPort?.postMessage({ event: 'updated', name: job.data.name_with_owner, ...progress }),
    })
      .catch((error: Error) => {
        errorLogger.error('Metadata: ' + JSON.stringify({ repository: job.data.id, resources: workerData.resources }));
        errorLogger.error(error);
        throw error;
      })
      .finally(() => parentPort?.postMessage({ event: 'finished', name: job.data.name_with_owner }));
  }, workerData.concurrency);
}

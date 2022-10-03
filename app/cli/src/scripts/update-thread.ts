import { isMainThread, parentPort, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/lib';

import { withBullWorker } from '../helpers/withBullQueue';
import { errorLogger, updater } from './update';

if (!isMainThread) {
  withBullWorker(async (job) => {
    if (!job.id) throw new Error('Invlaid job:id!');

    parentPort?.postMessage({ event: 'started', name: job.id });
    return updater(job.id.toString(), {
      httpClient: new HttpClient(workerData.httpClientOpts),
      resources: workerData.resources,
      onProgress: (progress) => parentPort?.postMessage({ event: 'updated', name: job.id, ...progress }),
    })
      .catch((error: Error) => {
        errorLogger.error(
          'Metadata: ' + JSON.stringify({ repository: job.id?.toString(), resources: workerData.resources }),
        );
        errorLogger.error(error);
        throw error;
      })
      .finally(() => parentPort?.postMessage({ event: 'finished', name: job.id }));
  }, workerData.concurrency);
}

import { all, map } from 'bluebird';
import { MultiBar, SingleBar } from 'cli-progress';
import consola from 'consola';
import { truncate } from 'lodash';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

import { HttpClient } from '@gittrends/lib';

import { withBullQueue } from '../helpers/withBullQueue';
import { errorLogger, updater } from './update';

if (!isMainThread) {
  withBullQueue(async (queue) => {
    return queue.process('repositories', workerData.concurrency, async (job) => {
      parentPort?.postMessage({ event: 'started', name: job.id });
      return updater(job.id.toString(), {
        httpClient: new HttpClient(workerData.httpClientOpts),
        resources: workerData.resources,
        onProgress: (progress) => parentPort?.postMessage({ event: 'updated', name: job.id, ...progress }),
      })
        .catch((error: Error) => {
          consola.error(error);
          errorLogger.error(
            'Metadata: ' + JSON.stringify({ repository: job.id.toString(), resources: workerData.resources }),
          );
          errorLogger.error(error);
          throw error;
        })
        .finally(() => parentPort?.postMessage({ event: 'finished', name: job.id }));
    });
  });
}

export async function redisQueue(opts: {
  resources: string[];
  httpClient: HttpClient;
  concurrency: number;
  threads?: number;
  multibar?: MultiBar;
}) {
  const threadsConcurrency = Array.from(Array(opts.threads || 1)).fill(
    Math.floor(opts.concurrency / (opts.threads || 1)),
  );
  for (let i = 0; i < opts.concurrency % (opts.threads || 1); i++) threadsConcurrency[i] += 1;

  await all(
    map(
      threadsConcurrency,
      (concurrency) =>
        new Promise<void>((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: {
              concurrency: concurrency,
              resources: opts.resources,
              httpClientOpts: opts.httpClient.toJSON(),
            },
          });

          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
            else resolve();
          });

          const progressBars: Record<string, SingleBar> = {};

          worker.on(
            'message',
            (progress: {
              event: 'started' | 'updated' | 'finished';
              name: string;
              current: number;
              total?: number;
            }) => {
              if (!opts.multibar) return;
              switch (progress.event) {
                case 'started':
                  progressBars[progress.name] = opts.multibar.create(Infinity, 0, {
                    resource: truncate(progress.name, { length: 28, omission: '..' }).padStart(30, ' '),
                  });
                  break;
                case 'updated':
                  if (progress.total) progressBars[progress.name].setTotal(progress.total);
                  progressBars[progress.name].update(progress.current);
                  break;
                case 'finished':
                  opts.multibar.remove(progressBars[progress.name]);
                  break;
              }
            },
          );
        }),
    ),
  );
}

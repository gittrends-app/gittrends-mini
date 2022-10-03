import { all, map } from 'bluebird';
import { MultiBar, SingleBar } from 'cli-progress';
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
      (concurrency, index) =>
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

          const totals: Record<string, number> = {};
          const progressBar: SingleBar | undefined = opts.multibar?.create(Infinity, 0);

          worker.on(
            'message',
            (progress: {
              event: 'started' | 'updated' | 'finished';
              name: string;
              current: number;
              total?: number;
            }) => {
              if (!opts.multibar || !progressBar) return;
              const name = truncate(progress.name, { length: 25, omission: '..' }).padStart(40, ' ');
              switch (progress.event) {
                case 'started':
                  progressBar.update(0, { resource: name });
                  break;
                case 'updated':
                  if (progress.total) totals[progress.name] = progress.total;
                  progressBar.setTotal(totals[progress.name]);
                  progressBar.update(progress.current, { resource: `Thread ${index + 1} - ${name}` });
                  break;
                case 'finished':
                  opts.multibar.remove(progressBar);
                  break;
              }
            },
          );
        }),
    ),
  );
}

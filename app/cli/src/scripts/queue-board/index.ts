import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import apicache from 'apicache';
import { map } from 'bluebird';
import { json } from 'body-parser';
import { JobType } from 'bullmq';
import { Option, program } from 'commander';
import consola from 'consola';
import express from 'express';
import internalIP from 'internal-ip';
import { compact, range } from 'lodash';
import morgan from 'morgan';
import path, { extname, resolve } from 'node:path';
import { SHARE_ENV, Worker } from 'node:worker_threads';

import { HttpClient } from '@gittrends/github/dist';

import { withBullEvents, withBullQueue, withBullWorker } from '../../helpers/withBullQueue';
import { version } from '../../package.json';
import { schedule } from '../schedule';

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  const threads: Array<{ worker: Worker; concurrency: number }> = [];
  const scheduler: { ref?: Promise<void>; done: boolean } = { done: true };

  await program
    .addOption(new Option('--http-logging'))
    .addOption(new Option('--port <number>', 'Port to run board app').env('PORT').default(8080).makeOptionMandatory())
    .action(async (opts: { httpLogging: boolean; port: number }) => {
      const app = express();

      app.use(json());
      app.use('/public', express.static(resolve(__dirname, '..', '..', '..', 'assets')));

      if (opts.httpLogging) app.use(morgan('combined'));

      const queue = withBullQueue();
      const events = withBullEvents();
      const monitor = withBullWorker(() => Promise.reject('monitor'), 0);

      const apiCacheMiddleware = apicache.middleware('2 seconds');

      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath('/bull-queue');

      createBullBoard({
        queues: [new BullMQAdapter(queue, { allowRetries: true })],
        serverAdapter: serverAdapter,
      });

      app.use('/bull-queue', serverAdapter.getRouter());

      const ip = await internalIP.v4();

      // other configurations of your server
      const server = app.listen(opts.port, () => {
        consola.success(`For the UI, open http://${ip || '127.0.0.1'}:${opts.port}/`);
      });

      app.get('/', (_, res) => res.redirect('/public/queue-board.html'));

      app.get('/api/jobs', apiCacheMiddleware, async (req, res) => {
        const state = (req.query.state?.toString().toLowerCase() || undefined) as JobType;

        res.json(
          await queue
            .getJobs(state)
            .then(compact)
            .then((jobs) => map(jobs, async (job) => job && Object.assign(job, { state: await job?.getState() }))),
        );
      });

      app.get('/api/jobs-count', apiCacheMiddleware, async (req, res) => {
        res.json(await queue.getJobCounts());
      });

      app.get('/api/updater', async (_, res) => {
        res.json(threads.map(({ worker, ...data }) => ({ id: worker.threadId, ...data })));
      });

      app.post('/api/updater', async (req, res) => {
        if (!process.env.CLI_API_URL) throw new Error('Environment variable CLI_API_URL is missing!');

        if (req.body.workers === undefined || req.body.threads === undefined)
          return res.status(400).json({
            message: 'Number of threads and workers are mandatory!',
            params: req.body,
          });

        const params: { workers: number; threads: number } = req.body;

        if (params.threads < threads.length) {
          await Promise.all(threads.slice(params.threads - threads.length).map((thread) => thread.worker.terminate()));
          threads.splice(params.threads - threads.length);
        }

        if (params.threads > 0) {
          const concurrency = Math.ceil(params.workers / params.threads);
          const { hostname, protocol, port } = new URL(process.env.CLI_API_URL as string);

          const httpClientOpts = new HttpClient({
            host: hostname,
            protocol: protocol.slice(0, -1),
            port: parseInt(port),
            timeout: 60000,
            retries: 2,
          }).toJSON();

          await map(range(params.threads), async (index) => {
            const diff = index === params.threads - 1 ? concurrency * params.threads - params.workers : 0;

            if (threads[index] && threads[index].concurrency < concurrency) {
              threads[index].worker.postMessage({ concurrency: (threads[index].concurrency = concurrency - diff) });
              return;
            }

            if (threads[index]) await threads[index].worker.terminate();

            const worker = new Worker(path.resolve(__dirname, '..', 'update', `update-thread${extname(__filename)}`), {
              env: SHARE_ENV,
              workerData: {
                cacheSize: parseInt(process.env.CACHE_SIZE || '100000'),
                concurrency: concurrency - diff,
                httpClientOpts,
              },
            });

            worker.on('message', (message) => consola.log(`worker ${worker.threadId}: ${JSON.stringify(message)}`));

            threads[index] = { worker, concurrency: concurrency - diff };

            return new Promise((resolve) => worker.on('online', resolve));
          });
        }

        res.json(threads.map(({ worker, ...data }) => ({ id: worker.threadId, ...data })));
      });

      app.get('/api/scheduler', async (req, res) => {
        res.json({ done: scheduler.done });
      });

      app.post('/api/scheduler', async (req, res) => {
        if (!scheduler.done) return;
        Object.assign(scheduler, {
          ref: schedule({ wait: 48, drain: req.body.drain !== undefined }).finally(() => (scheduler.done = true)),
          done: false,
        });
        res.sendStatus(201);
      });

      return new Promise<void>((resolve, reject) => {
        server.on('close', resolve);
        server.on('error', reject);
      }).finally(() => Promise.all([queue.close(), events.close(), monitor.close()]));
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

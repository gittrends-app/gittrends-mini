import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import apicache from 'apicache';
import { map } from 'bluebird';
import { JobType } from 'bullmq';
import { Option, program } from 'commander';
import consola from 'consola';
import express from 'express';
import internalIP from 'internal-ip';
import { compact } from 'lodash';
import morgan from 'morgan';
import { resolve } from 'node:path';

import { withBullEvents, withBullQueue } from '../../helpers/withBullQueue';
import { version } from '../../package.json';

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addOption(new Option('--port <number>', 'Port to run board app').env('PORT').default(8080).makeOptionMandatory())
    .action(async (opts: { port: number }) => {
      const app = express();

      app.use(morgan('combined'));
      app.use('/public', express.static(resolve(__dirname, '..', '..', '..', 'assets')));

      const queue = withBullQueue();
      const events = withBullEvents();

      const apiCacheMiddleware = apicache.middleware('5 seconds');

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

      return new Promise<void>((resolve, reject) => {
        server.on('close', resolve);
        server.on('error', reject);
      }).finally(() => Promise.all([queue.close(), events.close()]));
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

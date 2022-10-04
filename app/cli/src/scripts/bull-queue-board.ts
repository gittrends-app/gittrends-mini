import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Option, program } from 'commander';
import consola from 'consola';
import express from 'express';

import { withBullQueue } from '../helpers/withBullQueue';
import { version } from '../package.json';

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addOption(new Option('--port <number>', 'Port to run board app').env('PORT').default(8080).makeOptionMandatory())
    .action(async (opts: { port: number }) => {
      await withBullQueue(async (queue) => {
        const serverAdapter = new ExpressAdapter();
        serverAdapter.setBasePath('/');

        createBullBoard({
          queues: [new BullMQAdapter(queue, { readOnlyMode: true })],
          serverAdapter: serverAdapter,
        });

        const app = express();

        app.use('/', serverAdapter.getRouter());

        // other configurations of your server
        const server = app.listen(opts.port, () => {
          consola.success(`Running on ${opts.port}...`);
          consola.success(`For the UI, open http://localhost:${opts.port}/`);
        });

        return new Promise((resolve, reject) => {
          server.on('close', resolve);
          server.on('error', reject);
        });
      });
    })
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

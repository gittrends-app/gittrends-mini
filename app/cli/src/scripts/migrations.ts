import { AsyncWorker, queue } from 'async';
import { Command, program } from 'commander';
import consola from 'consola';
import { GlobSync } from 'glob';
import { resolve } from 'path';

import { BASE_DIR, createOrConnectDatabase, migrate } from '../config/knex.config';
import { version } from '../package.json';

async function forEach(queueFunction: AsyncWorker<string>) {
  consola.info('Searching for .sqlite files ...');
  const matches = new GlobSync('**/*.sqlite', { cwd: BASE_DIR });

  consola.info('Preparing processing queue ...');
  const q = queue(queueFunction, 10);

  q.push(matches.found);

  await q.drain();

  consola.success('Done!');
}

program
  .addCommand(
    new Command('migrate').action(async () =>
      forEach((db: string, callback) => {
        consola.log(`-> migrating ${db}`);
        return migrate(resolve(BASE_DIR, db))
          .then(() => callback())
          .catch((error) => callback(error));
      }),
    ),
  )
  .addCommand(
    new Command('unlock').action(() =>
      forEach((db: string, callback) => {
        consola.log(`-> unlocking ${db}`);
        return createOrConnectDatabase(resolve(BASE_DIR, db), false)
          .then((conn) => conn.migrate.forceFreeMigrationsLock().finally(() => conn.destroy()))
          .then(() => callback())
          .catch((error) => callback(error));
      }),
    ),
  )
  .helpOption(true)
  .version(version)
  .parse(process.argv);

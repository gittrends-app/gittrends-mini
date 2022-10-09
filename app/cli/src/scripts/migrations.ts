import { AsyncWorker, queue } from 'async';
import { Command, program } from 'commander';
import consola from 'consola';

import { Repository } from '@gittrends/entities';

import { createOrConnectDatabase, migrate, rollback } from '../config/knex.config';
import { withDatabase } from '../helpers/withDatabase';
import { version } from '../package.json';

async function forEach(queueFunction: AsyncWorker<string>) {
  consola.info('Preparing processing queue ...');
  const q = queue(queueFunction, 10);

  q.push(
    await withDatabase('public', ({ knex }) =>
      knex
        .from(Repository.__collection_name)
        .select('name_with_owner')
        .then((repos) => repos.map((repo) => repo.name_with_owner)),
    ),
  );

  await q.drain();

  consola.success('Done!');
}

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addCommand(
      new Command('migrate').action(async () =>
        forEach((db: string, callback) => {
          consola.log(`-> migrating ${db}`);
          return migrate(db)
            .then(() => callback())
            .catch((error) => callback(error));
        }),
      ),
    )
    .addCommand(
      new Command('rollback').action(async () =>
        forEach((db: string, callback) => {
          consola.log(`-> rolling back ${db}`);
          return rollback(db)
            .then(() => callback())
            .catch((error) => callback(error));
        }),
      ),
    )
    .addCommand(
      new Command('unlock').action(() =>
        forEach((db: string, callback) => {
          consola.log(`-> unlocking ${db}`);
          return createOrConnectDatabase(db, false)
            .then((conn) => conn.migrate.forceFreeMigrationsLock().finally(() => conn.destroy()))
            .then(() => callback())
            .catch((error) => callback(error));
        }),
      ),
    )
    .helpOption(true)
    .version(version)
    .parseAsync(args, { from });
}

if (require.main === module) cli(process.argv);

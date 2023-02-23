import { AsyncWorker, queue } from 'async';
import { Argument, Command, program } from 'commander';
import consola from 'consola';

import { Repository } from '@gittrends/entities';

import { createOrConnectDatabase, migrate, rollback } from '../config/knex.config';
import { withDatabase } from '../helpers/withDatabase';
import { version } from '../package.json';

async function forEach(queueFunction: AsyncWorker<string>) {
  consola.info('Preparing processing queue ...');
  const q = queue(queueFunction, parseInt(process.env.CLI_MIGRATIONS_WORKERS || '10'));

  q.push(
    await withDatabase({ name: 'public', migrate: true }, ({ knex }) =>
      knex
        .from(Repository.__name)
        .select('name_with_owner')
        .then((repos: { name_with_owner: string }[]) => repos.map((repo) => repo.name_with_owner)),
    ),
  );

  q.push('public');

  await q.drain();

  consola.success('Done!');
}

export async function cli(args: string[], from: 'user' | 'node' = 'node'): Promise<void> {
  await program
    .addCommand(
      new Command('migrate')
        .addArgument(new Argument('[repo...]', 'Repository names to run migrations').default(undefined))
        .action(async (repos?: string[]) => {
          async function migrateRepo(db: string): Promise<void> {
            consola.log(`-> migrating ${db}`);
            return migrate(db);
          }

          if (repos?.length) {
            return Promise.all(repos.map(migrateRepo)).then(() => undefined);
          }

          return forEach((name, callback) =>
            migrateRepo(name)
              .then(() => callback())
              .catch(callback),
          );
        }),
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
          return createOrConnectDatabase(db)
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

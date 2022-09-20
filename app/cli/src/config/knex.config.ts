import { mkdir } from 'fs/promises';
import { knex } from 'knex';
import { homedir } from 'os';
import path, { resolve } from 'path';

export async function createOrConnectDatabase(name: string | 'repositories') {
  const databaseFile = path.resolve(homedir(), '.gittrends', ...name.split('/')) + '.sqlite';

  await mkdir(path.dirname(databaseFile), { recursive: true });

  const knexInstance = knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: { filename: databaseFile },
  });

  await Promise.all([
    knexInstance.raw('PRAGMA busy_timeout=30000;'),
    knexInstance.migrate.latest({ directory: resolve(__dirname, 'migrations') }),
  ]);

  return knexInstance;
}

import { mkdirSync } from 'fs';
import knex, { Knex } from 'knex';
import { isNil, mapValues, omitBy } from 'lodash';
import { homedir } from 'os';
import { dirname, extname, resolve } from 'path';

export const BASE_DIR = resolve(homedir(), '.gittrends', process.env.NODE_ENV || 'development');

function knexResponseParser(result: any) {
  if (result.command && result.rows) return result;
  return mapValues(omitBy(result, isNil), (value) => {
    if (value === 'TRUE') return true;
    else if (value === 'FALSE') return false;
    else return value;
  });
}

export async function createOrConnectDatabase(repo: string) {
  const databaseFile = resolve(BASE_DIR, ...repo.split('/')) + '.sqlite';

  mkdirSync(dirname(databaseFile), { recursive: true });

  const conn = knex({
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: { filename: databaseFile },
    migrations: {
      directory: resolve(__dirname, 'migrations'),
      tableName: '_migrations',
      loadExtensions: [extname(__filename)],
    },
    postProcessResponse(result) {
      if (Array.isArray(result)) return result.map(knexResponseParser);
      return knexResponseParser(result);
    },
  });

  return migrate(conn).then(() => conn);
}

export async function migrate(db: string | Knex): Promise<void> {
  if (typeof db === 'string') {
    const conn = await createOrConnectDatabase(db);
    return migrate(conn).finally(() => conn.destroy());
  }

  return db.migrate.latest({ directory: resolve(__dirname, 'migrations') });
}
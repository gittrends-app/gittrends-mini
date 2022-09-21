import { mkdirSync } from 'fs';
import knex, { Knex } from 'knex';
import { isNil, omitBy } from 'lodash';
import { homedir } from 'os';
import { dirname, extname, resolve } from 'path';

function knexResponseParser(result: any) {
  if (result.command && result.rows) return result;
  return omitBy(result, isNil);
}

export async function createOrConnectDatabase(db: string | 'public') {
  const databaseFile = resolve(homedir(), '.gittrends', ...db.split('/')) + '.sqlite';

  mkdirSync(dirname(databaseFile), { recursive: true });

  const conn = knex({
    client: 'sqlite3',
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

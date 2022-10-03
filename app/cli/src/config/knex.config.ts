import { mkdirSync } from 'fs';
import { GlobSync } from 'glob';
import knex, { Knex } from 'knex';
import { isNil, mapValues, omitBy, size } from 'lodash';
import { homedir } from 'os';
import { dirname, extname, resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const baseDir = resolve(homedir(), '.gittrends', process.env.NODE_ENV || 'development');

knex.QueryBuilder.extend('insertEntity', function (value: Record<string, unknown>) {
  const sqliteFormattedValue = mapValues(value, (value) => {
    if (isProduction) {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' || Array.isArray(value)) {
        if (size(value) === 0) return undefined;
        return JSON.stringify(value);
      }
      return value;
    }

    if (typeof value === 'boolean') return value.toString().toUpperCase();
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object' || Array.isArray(value)) {
      if (size(value) === 0) return undefined;
      return JSON.stringify({ $Object: value });
    }
    return value;
  });

  return this.insert(sqliteFormattedValue as any);
});

export async function getRepositoriesList(): Promise<string[]> {
  if (isProduction) {
    return createOrConnectDatabase('public')
      .then((conn) => conn.raw('SELECT schema_name FROM information_schema.schemata;').finally(() => conn.destroy()))
      .then(({ rows }) => rows.map((res: { schema_name: string }) => res.schema_name.replace(/\[dot\]/g, '.')))
      .then((names) => names.filter((name: string) => /.\/./gi.test(name)));
  }

  const { found } = new GlobSync('**/*.sqlite', { cwd: baseDir });
  return found.map((file) => file.replace(/\.sqlite$/i, ''));
}

function knexResponseParser(result: any) {
  if (!result) return result;
  if (result.command && result.rows) return result;
  if (isProduction) return omitBy(result, isNil);
  return mapValues(omitBy(result, isNil), (value) => {
    if (typeof value !== 'string') return value;
    if (value === 'TRUE') return true;
    else if (value === 'FALSE') return false;
    else if (value.startsWith('{"$Object":')) return JSON.parse(value).$Object;
    else return value;
  });
}

function getConnectionSettings(repo: string): Knex.Config<any> {
  if (isProduction) {
    return {
      client: 'pg',
      connection: {
        host: process.env.CLI_POSTGRES_HOST ?? '127.0.0.1',
        port: process.env.CLI_POSTGRES_PORT ?? 5432,
        user: process.env.CLI_POSTGRES_USERNAME ?? 'root',
        password: process.env.CLI_POSTGRES_PASSWORD ?? 'root',
        database: process.env.CLI_POSTGRES_DATABASE ?? 'gittrends.app',
      },
      searchPath: [repo.replace(/\./g, '[dot]')],
      pool: {
        min: parseInt(process.env.CLI_POSTGRES_POOL_MIN || '1'),
        max: parseInt(process.env.CLI_POSTGRES_POOL_MAX || '3'),
      },
    };
  }

  const databaseFile = resolve(baseDir, ...repo.toLowerCase().split('/')) + '.sqlite';
  mkdirSync(dirname(databaseFile), { recursive: true });
  return {
    client: 'better-sqlite3',
    acquireConnectionTimeout: 60000,
    useNullAsDefault: true,
    connection: { filename: databaseFile },
  };
}

export async function createOrConnectDatabase(repo: string, _migrate = true) {
  const conn = knex({
    ...getConnectionSettings(repo.toLowerCase()),
    migrations: {
      directory: resolve(__dirname, 'migrations'),
      tableName: '_migrations',
      loadExtensions: [extname(__filename)],
    },
    postProcessResponse(result) {
      if (Array.isArray(result)) return result.map(knexResponseParser);
      else return knexResponseParser(result);
    },
  });

  if (_migrate) {
    if (isProduction) await conn.schema.createSchemaIfNotExists(repo.replace(/\./g, '[dot]').toLowerCase());
    await conn.migrate.latest();
  }

  return conn;
}

export async function migrate(db: string | Knex): Promise<void> {
  if (typeof db === 'string') {
    const conn = await createOrConnectDatabase(db);
    if (isProduction) await conn.schema.createSchemaIfNotExists(db.replace(/\./g, '[dot]').toLowerCase());
    return migrate(conn).finally(() => conn.destroy());
  }

  return db.migrate.latest();
}

import { mkdirSync } from 'fs';
import knex, { Knex } from 'knex';
import { isNil, mapValues, omitBy, size } from 'lodash';
import { homedir } from 'os';
import { dirname, extname, resolve } from 'path';

import { Repository } from '@gittrends/entities';

type TargetDatabase = 'sqlite' | 'postgres';

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

if (process.env.CLI_DATABASE) {
  process.env.CLI_DATABASE = process.env.CLI_DATABASE.toLowerCase();
  if (!['sqlite', 'postgres'].includes(process.env.CLI_DATABASE)) throw new Error('Invalid database type');
}

const targetDatabase = (process.env.CLI_DATABASE || 'sqlite') as TargetDatabase;
const baseDir = resolve(homedir(), '.gittrends', process.env.NODE_ENV);

knex.QueryBuilder.extend('insertEntity', function (value: Record<string, unknown>) {
  const sqliteFormattedValue = mapValues(value, (value) => {
    if (targetDatabase === 'postgres') {
      // eslint-disable-next-line no-control-regex
      if (typeof value === 'string') return value.replace(/\u0000/g, '\\u0000');
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' || Array.isArray(value)) {
        if (size(value) === 0) return undefined;
        return JSON.stringify(value);
      }
    }

    if (targetDatabase === 'sqlite') {
      if (typeof value === 'boolean') return value.toString().toUpperCase();
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' || Array.isArray(value)) {
        if (size(value) === 0) return undefined;
        return JSON.stringify({ $Object: value });
      }
    }

    return value;
  });

  return this.insert(sqliteFormattedValue as any);
});

export async function getRepositoriesList(): Promise<string[]> {
  return createOrConnectDatabase('public').then((conn) =>
    conn
      .from(Repository.__collection_name)
      .select('name_with_owner')
      .then((repos) => repos.map((repo) => repo.name_with_owner))
      .finally(() => conn.destroy()),
  );
}

function knexResponseParser(result: any) {
  if (!result) return result;
  if (result.command && result.rows) return result;

  if (targetDatabase === 'postgres') {
    return mapValues(omitBy(result, isNil), (value) => {
      if (typeof value !== 'string') return value;
      else return value.replace(/\\u0000/g, '\u0000');
    });
  }

  if (targetDatabase === 'sqlite') {
    return mapValues(omitBy(result, isNil), (value) => {
      if (typeof value !== 'string') return value;
      if (value === 'TRUE') return true;
      else if (value === 'FALSE') return false;
      else if (value.startsWith('{"$Object":')) return JSON.parse(value).$Object;
      else return value;
    });
  }

  throw new Error(`Invalid target database "${targetDatabase}"!`);
}

function getConnectionSettings(repo: string): Knex.Config<any> {
  if (targetDatabase === 'postgres') {
    return {
      client: 'pg',
      connection: {
        host: process.env.CLI_DATABASE_HOST ?? '127.0.0.1',
        port: parseInt(process.env.CLI_DATABASE_PORT ?? '5432'),
        user: process.env.CLI_DATABASE_USERNAME ?? 'root',
        password: process.env.CLI_DATABASE_PASSWORD ?? 'root',
        database: process.env.CLI_DATABASE_DB ?? 'gittrends.app',
      },
      searchPath: [repo.replace(/\./g, '[dot]').slice(0, 63)], // postgres limita a 63 chars nome de schemas
      pool: {
        min: repo.toLowerCase() === 'public' ? 0 : parseInt(process.env.CLI_DATABASE_POOL_MIN || '1'),
        max: repo.toLowerCase() === 'public' ? 1 : parseInt(process.env.CLI_DATABASE_POOL_MAX || '3'),
      },
    };
  }

  if (targetDatabase === 'sqlite') {
    const databaseFile = resolve(baseDir, ...repo.toLowerCase().split('/')) + '.sqlite';
    mkdirSync(dirname(databaseFile), { recursive: true });
    return {
      client: 'better-sqlite3',
      acquireConnectionTimeout: 60000,
      useNullAsDefault: true,
      connection: { filename: databaseFile },
    };
  }

  throw new Error(`Invalid target database "${targetDatabase}"!`);
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
    if (targetDatabase === 'postgres')
      await conn.schema.createSchemaIfNotExists(repo.replace(/\./g, '[dot]').toLowerCase());
    await conn.migrate.latest();
  }

  return conn;
}

export async function migrate(db: string | Knex): Promise<void> {
  if (typeof db === 'string') {
    const conn = await createOrConnectDatabase(db);
    if (targetDatabase === 'postgres')
      await conn.schema.createSchemaIfNotExists(db.replace(/\./g, '[dot]').toLowerCase().slice(0, 63)); // postgres limita a 63 chars nome de schemas
    return migrate(conn).finally(() => conn.destroy());
  }

  return db.migrate.latest();
}

export async function rollback(db: string | Knex): Promise<void> {
  if (typeof db === 'string') {
    const conn = await createOrConnectDatabase(db);
    if (targetDatabase === 'postgres')
      await conn.schema.createSchemaIfNotExists(db.replace(/\./g, '[dot]').toLowerCase().slice(0, 63)); // postgres limita a 63 chars nome de schemas
    return rollback(conn).finally(() => conn.destroy());
  }

  return db.migrate.rollback();
}

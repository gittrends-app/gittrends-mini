import { Knex as KnexOriginal } from 'knex';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production' | string;

      CLI_API_URL?: string;
      CLI_ACCESS_TOKEN?: string;

      CLI_DATABASE?: 'sqlite' | 'postgres' | string;
      CLI_DATABASE_HOST?: string;
      CLI_DATABASE_PORT?: number;
      CLI_DATABASE_USERNAME?: string;
      CLI_DATABASE_PASSWORD?: string;
      CLI_DATABASE_DB?: string;
      CLI_DATABASE_POOL_MIN?: string;
      CLI_DATABASE_POOL_MAX?: string;

      CLI_REDIS_HOST?: string;
      CLI_REDIS_PORT?: number;
      CLI_REDIS_DB?: number;

      CLI_MIGRATIONS_WORKERS?: string;

      CLI_SCHEDULER_WORKERS?: string;
      CLI_SCHEDULER_ATTEMPS?: string;

      CLI_WRITE_BATCH?: string;
      CLI_WRITE_BATCH_STARGAZERS?: number;
      CLI_WRITE_BATCH_WATCHERS?: number;
      CLI_WRITE_BATCH_TAGS?: number;
      CLI_WRITE_BATCH_RELEASES?: number;
      CLI_WRITE_BATCH_DEPENDENCIES?: number;
      CLI_WRITE_BATCH_ISSUES?: number;
      CLI_WRITE_BATCH_PULL_REQUESTS?: number;
    }
  }
}

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
      insertEntity<TRecord, TResult>(entity: any): KnexOriginal.QueryBuilder<TRecord, TResult>;
    }
  }
}

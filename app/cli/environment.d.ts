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
      CLI_DATABASE_PORT?: string;
      CLI_DATABASE_USERNAME?: string;
      CLI_DATABASE_PASSWORD?: string;
      CLI_DATABASE_DB?: string;
      CLI_DATABASE_POOL_MIN?: string;
      CLI_DATABASE_POOL_MAX?: string;

      CLI_REDIS_HOST?: string;
      CLI_REDIS_PORT?: string;
      CLI_REDIS_DB?: string;

      CLI_MIGRATIONS_WORKERS?: string;
      CLI_MIGRATIONS_DISABLE_VALIDATION?: string;

      CLI_SCHEDULER_WORKERS?: string;
      CLI_SCHEDULER_ATTEMPS?: string;
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

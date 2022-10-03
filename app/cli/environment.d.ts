import { Knex as KnexOriginal } from 'knex';

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production';
      CLI_POSTGRES_HOST?: string;
      CLI_POSTGRES_PORT?: number;
      CLI_POSTGRES_USERNAME?: string;
      CLI_POSTGRES_PASSWORD?: string;
      CLI_POSTGRES_DATABASE?: string;
      CLI_POSTGRES_POOL_MIN?: string;
      CLI_POSTGRES_POOL_MAX?: string;
      CLI_REDIS_HOST?: string;
      CLI_REDIS_PORT?: number;
      CLI_REDIS_DB?: number;
      CLI_QUEUE_ATTEMPS?: number;
      CLI_ACCESS_TOKEN?: string;
      CLI_API_URL?: string;
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

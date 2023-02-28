import { Knex as KnexOriginal } from 'knex';

import { Entity } from '@gittrends/entities';

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

      CLI_CACHE_HOST?: string;
      CLI_CACHE_PORT?: string;
      CLI_CACHE_FILE?: string;

      CLI_UPDATER_ITERATIONS?: string;
    }
  }

  type Constructor<T> = { new (...args: any): T };
  type EntityConstructor<T> = { new (...args: any): T } & typeof Entity;
  type Prototype<T> = { prototype: T };
  type EntityPrototype<T> = ({ prototype: T } | { new (...args: any[]): T }) & typeof Entity<T>;
}

declare module 'knex' {
  namespace Knex {
    interface QueryBuilder {
      insertEntity<TRecord, TResult>(entity: any): KnexOriginal.QueryBuilder<TRecord, TResult>;
    }
  }
}

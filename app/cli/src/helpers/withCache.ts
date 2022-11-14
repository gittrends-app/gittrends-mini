import { Cache } from '@gittrends/service';

import { EntitiesCache } from '../cache/EntitiesCache';

const REDIS_HOST = process.env.CLI_REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.CLI_REDIS_PORT || '6379');
const REDIS_DB = parseInt(process.env.CLI_CACHE_DB || '1');

export async function withCache<T = any>(callback: (queue: Cache) => Promise<T>): Promise<T>;
export function withCache(): Cache;
export function withCache(callback?: any): any {
  const cache = new EntitiesCache(
    { host: REDIS_HOST, port: REDIS_PORT, db: REDIS_DB },
    parseInt(process.env.CLI_CACHE_DB || '500000'),
  );

  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

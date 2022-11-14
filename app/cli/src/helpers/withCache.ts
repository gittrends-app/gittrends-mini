import { Cache } from '@gittrends/service';

import { EntitiesCache } from '../cache/EntitiesCache';

const REDIS_HOST = process.env.CLI_CACHE_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.CLI_CACHE_PORT || '11211');

export async function withCache<T = any>(callback: (queue: Cache) => Promise<T>): Promise<T>;
export function withCache(): Cache;
export function withCache(callback?: any): any {
  const cache = new EntitiesCache({ host: REDIS_HOST, port: REDIS_PORT });

  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

import { homedir } from 'node:os';
import { join } from 'node:path';

import { AppCache } from '../cache/AppCache';
import { LevelDBProvider } from '../cache/LevelDBProvider';
import { MemcachedProvider } from '../cache/MemcachedProvider';

const CACHE_HOST = process.env.CLI_CACHE_HOST || 'localhost';
const CACHE_PORT = parseInt(process.env.CLI_CACHE_PORT || '11211');
const CACHE_FILE = process.env.CLI_CACHE_FILE || join(homedir(), '.gittrends.cache');

type CacheProvider = 'memory' | 'file';
type CacheCallback<T> = (queue: AppCache) => Promise<T>;

export async function withCache<T = any>(provider: CacheProvider, callback: CacheCallback<T>): Promise<T>;
export function withCache(provider: CacheProvider): AppCache;
export function withCache(provider: CacheProvider, callback?: CacheCallback<any>): any {
  const cache = new AppCache(
    provider === 'memory'
      ? new MemcachedProvider({ host: CACHE_HOST, port: CACHE_PORT })
      : new LevelDBProvider({ file: CACHE_FILE }),
  );
  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

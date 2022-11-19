import { DatabaseCache } from '../cache/DatabaseCache';
import { MemoryCache } from '../cache/MemoryCache';
import { withDatabase } from './withDatabase';

const REDIS_HOST = process.env.CLI_CACHE_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.CLI_CACHE_PORT || '11211');

export async function withMemoryCache<T = any>(callback: (queue: MemoryCache) => Promise<T>): Promise<T>;
export function withMemoryCache(): MemoryCache;
export function withMemoryCache(callback?: any): any {
  const cache = new MemoryCache({ host: REDIS_HOST, port: REDIS_PORT });
  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

export async function withDatabaseCache<T = any>(callback: (queue: DatabaseCache) => Promise<T>): Promise<T>;
export async function withDatabaseCache(): Promise<DatabaseCache>;
export async function withDatabaseCache(callback?: any): Promise<any> {
  const cache = new DatabaseCache(await withDatabase({ name: 'public_cache', migrate: true }));
  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

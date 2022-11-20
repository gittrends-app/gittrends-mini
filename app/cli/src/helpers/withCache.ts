import { AppCache } from '../cache/AppCache';
import { LocalProvider } from '../cache/LocalProvider';

const CACHE_HOST = process.env.CLI_CACHE_HOST || 'localhost';
const CACHE_PORT = parseInt(process.env.CLI_CACHE_PORT || '11211');

export async function withCache<T = any>(callback: (queue: AppCache) => Promise<T>): Promise<T>;
export function withCache(): AppCache;
export function withCache<T = any>(callback?: (queue: AppCache) => Promise<T>): any {
  const cache = new AppCache(new LocalProvider({ host: CACHE_HOST, port: CACHE_PORT }));
  return callback ? callback(cache).finally(() => cache.close()) : cache;
}

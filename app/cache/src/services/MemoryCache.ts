import LRUCache from 'lru-cache';
import ms from 'ms';

import { CacheServiceAPI } from './CacheAPI';

const getSizeInBytes = (obj: any) => {
  let str = null;
  if (typeof obj === 'string') {
    // If obj is a string, then use it
    str = obj;
  } else {
    // Else, make obj into a string
    str = JSON.stringify(obj);
  }
  // Get the length of the Uint8Array
  const bytes = new TextEncoder().encode(str).length;
  return bytes;
};

export default class MemoryCache implements CacheServiceAPI {
  private cache: LRUCache<string, any>;

  constructor(opts: { cacheSize?: number; cleanupInterval?: string | number }) {
    this.cache = new LRUCache({
      maxSize: (opts.cacheSize || 8) * 1024 * 1024,
      sizeCalculation: (value) => getSizeInBytes(value),
      ttl: ms('1 day'),
      updateAgeOnGet: true,
    });
  }

  async add(key: string, value: string | Buffer, expires?: string | number): Promise<void> {
    this.cache.set(key, value, { ttl: ms(`${expires}` || '1 day') });
  }

  async get(key: string): Promise<string | Buffer | undefined> {
    return this.cache.get(key);
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async close(): Promise<void> {
    this.cache.clear();
  }
}

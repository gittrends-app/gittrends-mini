import LRUCache from 'lru-cache';
import ms from 'ms';
import sizeof from 'object-sizeof';

import { CacheServiceAPI } from './CacheAPI';

export default class MemoryCache implements CacheServiceAPI {
  private cache: LRUCache<string, any>;
  private ttl = '7 days';

  constructor(opts: { cacheSize?: number; cleanupInterval?: string | number }) {
    this.cache = new LRUCache({
      maxSize: (opts.cacheSize || 64) * 1024 * 1024,
      sizeCalculation: (value) => sizeof(value) * 1.25,
      ttl: ms(this.ttl),
      updateAgeOnGet: true,
    });
  }

  async add(key: string, value: string | Buffer, expires?: string | number): Promise<void> {
    this.cache.set(key, value, { ttl: ms(`${expires}` || this.ttl) });
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

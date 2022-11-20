import Memcached from 'memcached';
import { promisify } from 'util';

import { CacheProvider } from './AppCache';

export class MemcachedProvider implements CacheProvider {
  private cache: Memcached;

  private memcachedOperations: {
    add: (arg1: string, arg2: any, arg3: number) => Promise<boolean>;
    get: (arg1: string) => Promise<any>;
    del: (arg1: string) => Promise<boolean>;
  };

  constructor(opts: { host: string; port: number }) {
    const { host, port } = opts;
    this.cache = new Memcached(`${host}:${port}`, { maxExpiration: 60 * 60 * 24 });

    this.memcachedOperations = {
      add: promisify(this.cache.set.bind(this.cache)),
      get: promisify(this.cache.get.bind(this.cache)),
      del: promisify(this.cache.del.bind(this.cache)),
    };
  }

  async add(key: string, value: string | Buffer, expires: number): Promise<void> {
    await this.memcachedOperations.add(key, value, expires);
  }

  async get(key: string): Promise<string | Buffer | undefined> {
    return this.memcachedOperations.get(key);
  }

  async del(key: string): Promise<boolean> {
    return this.memcachedOperations.del(key);
  }

  async close(): Promise<void> {
    this.cache.end();
  }
}

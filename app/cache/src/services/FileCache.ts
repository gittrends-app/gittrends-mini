import leveldown from 'leveldown';
import levelup, { LevelUp } from 'levelup';
import ms from 'ms';

import { CacheServiceAPI } from './CacheAPI';

export default class FileCache implements CacheServiceAPI {
  private cache: LevelUp;
  private interval: NodeJS.Timeout;

  constructor(opts: { db: string; cacheSize?: number; cleanupInterval?: string | number }) {
    this.cache = levelup(leveldown(opts.db), { cacheSize: (opts.cacheSize || 8) * 1024 * 1024 });

    this.interval = setInterval(() => {
      this.cache.createReadStream().on('data', ({ value, key }) => {
        const { expires } = JSON.parse(value.toString());
        return expires && expires < Date.now() ? this.cache.del(key.toString()) : void 0;
      });
    }, ms(`${opts.cleanupInterval || '1 hour'}`));
  }

  async add(key: string, value: string | Buffer, expires?: string | number): Promise<void> {
    const expiresAt = expires ? Date.now() + ms(`${expires}`) : 0;
    return this.cache.put(key, JSON.stringify({ v: 1, expires: expiresAt, value }));
  }

  async get(key: string): Promise<string | Buffer | undefined> {
    return this.cache.get(key).then(async (result) => {
      if (!result) return;

      const { expires, value } = JSON.parse(result?.toString());

      if (expires && expires < Date.now()) {
        await this.cache.del(key);
        return Promise.reject({ notFound: true });
      }

      return value;
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.del(key).then(() => true);
  }

  async close(): Promise<void> {
    clearInterval(this.interval);
    return this.cache.close();
  }
}

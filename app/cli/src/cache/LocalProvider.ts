import { CacheAPI, createClient } from '@gittrends/cache';

import { CacheProvider } from './AppCache';

export class LocalProvider implements CacheProvider {
  private cache: CacheAPI;

  constructor(opts: { host: string; port: number }) {
    this.cache = createClient({ host: opts.host, port: opts.port });
  }

  async add(key: string, value: string | Buffer): Promise<void> {
    await this.cache.add(key, value);
  }

  async get(key: string): Promise<string | Buffer | undefined> {
    return this.cache.get(key);
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }
}

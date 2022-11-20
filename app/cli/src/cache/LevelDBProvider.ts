import leveldown from 'leveldown';
import levelup, { LevelUp } from 'levelup';

import { CacheProvider } from './AppCache';

export class LevelDBProvider implements CacheProvider {
  private cache: LevelUp;

  constructor(opts: { file: string }) {
    this.cache = levelup(leveldown(opts.file));
  }

  async add(key: string, value: string | Buffer): Promise<void> {
    await this.cache.put(key, value);
  }

  async get(key: string): Promise<string | Buffer | undefined> {
    return this.cache.get(key).catch(async (error) => (error.notFound ? undefined : Promise.reject(error)));
  }

  async del(key: string): Promise<boolean> {
    return this.cache.del(key).then(() => true);
  }

  async close(): Promise<void> {
    this.cache.close();
  }
}

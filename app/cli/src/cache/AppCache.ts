import { isNil, omitBy } from 'lodash';

import { Cache } from '@gittrends/service';

import { debug } from '@gittrends/helpers';

export const logger = debug('cli:entities-cache');

type EntityKey = Partial<{ id: string; name: string }>;

export interface CacheProvider {
  add(key: string, value: string | Buffer, expires: number): Promise<void>;
  get(key: string): Promise<string | Buffer | undefined>;
  del(key: string): Promise<boolean>;
  close?(): Promise<void>;
}

export class AppCache implements Cache<EntityKey> {
  constructor(private provider: CacheProvider) {
    logger(`Configuring entities cache...`);
  }

  private getCacheKey(entity: EntityKey, scope?: string): string {
    if (!entity.id && !entity.name) throw new Error('Cannot key enity key');
    const suffix = (entity.id ?? entity.name) as string;
    return scope ? `${scope}_${suffix}` : suffix;
  }

  async get<T>(key: EntityKey, scope: string): Promise<T | undefined> {
    logger(`Finding reference for ${key.id || key.name} on cache...`);
    return await this.provider.get(this.getCacheKey(key, scope)).then((res) => {
      if (!res) return undefined;
      return JSON.parse(res.toString()) as T;
    });
  }

  async add(entity: EntityKey & Record<string, unknown>, scope: string): Promise<void> {
    logger(`Adding ${entity.constructor.name} (key=${this.getCacheKey(entity)}) to cache...`);
    await this.provider.add(this.getCacheKey(entity, scope), JSON.stringify(omitBy(entity, isNil)), 0);
  }

  async delete(entity: EntityKey, scope: string): Promise<void> {
    await this.provider.del(this.getCacheKey(entity, scope));
  }

  async close(): Promise<void> {
    if (this.provider.close) await this.provider.close();
  }
}

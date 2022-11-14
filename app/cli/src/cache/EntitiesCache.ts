import { Cache as CacheManager, Store, caching } from 'cache-manager';

import { Cache } from '@gittrends/service';

import { Entity, Node } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

const logger = debug('cli:entities-cache');

type CacheKeys = Partial<Node & { name: string }>;

export class EntitiesCache implements Cache<CacheKeys> {
  private cache: CacheManager<Store> | undefined;
  private cacheConfigPromise: Promise<any> | undefined;

  private async config(): Promise<void> {
    if (!this.cacheConfigPromise) {
      logger(`Configuring entities cache with size ${this.size}...`);
      this.cacheConfigPromise = caching('memory', {
        max: this.size,
        ttl: 1000 * 60 * 60 * 24, // one day
        updateAgeOnGet: true,
        updateAgeOnHas: true,
      }).then((cache) => (this.cache = cache));
    }
    return this.cacheConfigPromise;
  }

  constructor(private size: number = 250000) {
    this.config();
  }

  private getCacheKey(entity: CacheKeys): string {
    if (entity.id) return entity.id;
    else if (entity.name) return entity.name;
    throw new Error('Cannt key enity key');
  }

  async get<T extends Entity>(props: CacheKeys): Promise<T | undefined> {
    if (!this.cache) await this.config();
    return this.cache?.get(this.getCacheKey(props));
  }

  async add(entity: Entity<any> & CacheKeys): Promise<void> {
    if (!this.cache) await this.config();
    logger(`Adding ${entity.constructor.name} (key=${this.getCacheKey(entity)}) to cache...`);
    this.cache?.set(this.getCacheKey(entity), entity);
  }

  async delete(entity: Entity<any> & CacheKeys): Promise<void> {
    if (!this.cache) await this.config();
    this.cache?.del(this.getCacheKey(entity));
  }
}

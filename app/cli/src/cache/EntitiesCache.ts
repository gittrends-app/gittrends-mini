import Memcached from 'memcached';
import { promisify } from 'util';

import { Cache } from '@gittrends/service';

import { Entity, Node } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

const logger = debug('cli:entities-cache');

type CacheKeys = Partial<Node & { name: string }>;

export class EntitiesCache implements Cache<CacheKeys> {
  private cache: Memcached;

  private memcached: {
    add: (key: string, value: string, expires: number) => Promise<any>;
    get: (key: string) => Promise<string | undefined>;
    del: (key: string) => Promise<boolean>;
  };

  constructor(opts: { host: string; port: number }) {
    logger(`Configuring entities cache...`);
    const { host, port } = opts;
    this.cache = new Memcached(`${host}:${port}`, { maxExpiration: 60 * 60 * 24 });

    this.memcached = {
      add: promisify(this.cache.set.bind(this.cache)),
      get: promisify(this.cache.get.bind(this.cache)),
      del: promisify(this.cache.del.bind(this.cache)),
    };
  }

  private getCacheKey(entity: CacheKeys): string {
    if (entity.id) return entity.id;
    else if (entity.name) return entity.name;
    throw new Error('Cannot key enity key');
  }

  async get<T extends Entity>(props: T & CacheKeys): Promise<Record<string, unknown> | undefined> {
    logger(`Finding reference for ${props.id || props.name} on cache...`);
    return await this.memcached
      .get(this.getCacheKey(props))
      .then((res) => (res ? JSON.parse(res.toString()) : undefined));
  }

  async add(entity: Entity<any> & CacheKeys): Promise<void> {
    logger(`Adding ${entity.constructor.name} (key=${this.getCacheKey(entity)}) to cache...`);
    await this.memcached.add(this.getCacheKey(entity), JSON.stringify(entity.toJSON()), 0);
  }

  async delete(entity: Entity<any> & CacheKeys): Promise<void> {
    await this.memcached.del(this.getCacheKey(entity));
  }

  async close() {
    this.cache.end();
  }
}

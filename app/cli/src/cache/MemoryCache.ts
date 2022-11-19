import { isNil, omitBy } from 'lodash';
import Memcached from 'memcached';
import { compressSync, uncompressSync } from 'snappy';
import { promisify } from 'util';

import { Cache } from '@gittrends/service';

import { Actor, Entity, Node } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

const logger = debug('cli:entities-cache');

type EntityKey = Partial<Node & { name: string }>;

export class MemoryCache implements Cache<EntityKey> {
  private cache: Memcached;

  private memcached: {
    add: (key: string, value: string | Buffer, expires: number) => Promise<any>;
    get: (key: string) => Promise<string | Buffer | undefined>;
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

  private getCacheKey(entity: EntityKey): string {
    if (entity.id) return entity.id;
    else if (entity.name) return entity.name;
    throw new Error('Cannot key enity key');
  }

  async get<T extends Entity>(EntityRef: EntityPrototype<T>, key: EntityKey): Promise<T | undefined> {
    logger(`Finding reference for ${key.id || key.name} on cache...`);
    return await this.memcached.get(this.getCacheKey(key)).then((res) => {
      if (!res) return undefined;
      if (EntityRef.prototype === Actor.prototype) return Actor.from(JSON.parse(uncompressSync(res).toString()));
      return new EntityRef.prototype.constructor(JSON.parse(uncompressSync(res).toString()));
    });
  }

  async add(entity: Entity & EntityKey): Promise<void> {
    logger(`Adding ${entity.constructor.name} (key=${this.getCacheKey(entity)}) to cache...`);
    await this.memcached.add(this.getCacheKey(entity), compressSync(JSON.stringify(omitBy(entity.toJSON(), isNil))), 0);
  }

  async delete(entity: Entity & EntityKey): Promise<void> {
    await this.memcached.del(this.getCacheKey(entity));
  }

  async close() {
    this.cache.end();
  }
}

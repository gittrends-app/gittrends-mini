import { isNil, omitBy } from 'lodash';

import { Cache } from '@gittrends/service';

import { Actor, Entity, Node } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

export const logger = debug('cli:entities-cache');

type EntityKey = Partial<Node & { name: string }>;

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

  private getCacheKey(entity: EntityKey): string {
    if (entity.id) return entity.id;
    else if (entity.name) return entity.name;
    throw new Error('Cannot key enity key');
  }

  async get<T extends Entity>(EntityRef: EntityPrototype<T>, key: EntityKey): Promise<T | undefined> {
    logger(`Finding reference for ${key.id || key.name} on cache...`);
    return await this.provider.get(this.getCacheKey(key)).then((res) => {
      if (!res) return undefined;
      if (EntityRef.prototype === Actor.prototype) return Actor.from(JSON.parse(res.toString()));
      return new EntityRef.prototype.constructor(JSON.parse(res.toString()));
    });
  }

  async add(entity: Entity & EntityKey): Promise<void> {
    logger(`Adding ${entity.constructor.name} (key=${this.getCacheKey(entity)}) to cache...`);
    await this.provider.add(this.getCacheKey(entity), JSON.stringify(omitBy(entity.toJSON(), isNil)), 0);
  }

  async delete(entity: Entity & EntityKey): Promise<void> {
    await this.provider.del(this.getCacheKey(entity));
  }

  async close(): Promise<void> {
    if (this.provider.close) await this.provider.close();
  }
}

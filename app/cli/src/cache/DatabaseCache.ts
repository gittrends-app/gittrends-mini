import { Cache } from '@gittrends/service';

import { Entity, Node } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { ExtendedEntityRepositories } from '../helpers/withDatabase';

const logger = debug('cli:entities-cache');

export class DatabaseCache implements Cache<Node> {
  constructor(private cache: ExtendedEntityRepositories) {
    logger(`Configuring entities cache...`);
  }

  async get<T extends Entity>(EntityRef: EntityPrototype<T>, key: Node): Promise<T | undefined> {
    return this.cache.get(EntityRef.prototype.constructor).findById(key.id) as any;
  }

  async add(entity: Entity<any> & Node): Promise<void> {
    return this.cache.get(entity.constructor).upsert(entity);
  }

  delete(entity: Entity<any> & Node): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async close(): Promise<void> {
    return this.cache.knex.destroy();
  }
}

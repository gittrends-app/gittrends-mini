import { compact, difference } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Repository, RepositoryResource } from '@gittrends/entities';

import { Cache } from './Cache';
import { Iterable, IterableRepositoryResources, Service } from './Service';

export class CachedService implements Service {
  private service: Service;
  private cache: Cache;

  constructor(service: Service, cache: Cache) {
    this.service = service;
    this.cache = cache;
  }

  async get(id: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get(Repository, id);
    if (cachedValue) return cachedValue;

    return this.service.get(id).then(async (value) => {
      if (value) await this.cache.add(value);
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get(Repository, name);
    if (cachedValue) return cachedValue;

    return this.service.find(name).then(async (value) => {
      if (value) await this.cache.add(value);
      return value;
    });
  }

  search?(opts: SearchComponentQuery): Iterable<Repository> {
    if (!this.service.search) throw new Error('Method not implemented on the provided service');
    return this.service.search(opts);
  }

  resources(
    repositoryId: string,
    resources: {
      resource: EntityConstructor<IterableRepositoryResources>;
      endCursor?: string | undefined;
      hasNextPage?: boolean | undefined;
    }[],
  ): Iterable<RepositoryResource> {
    return this.service.resources(repositoryId, resources);
  }

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    const actorIds = Array.isArray(id) ? id : [id];

    const actors = compact(await Promise.all(actorIds.map((id) => this.cache.get(Actor, id))));

    const pendingIds = difference(
      actorIds,
      actors.reduce((acc, a) => (a ? acc.concat(a.id) : acc), Array<string>()),
    );

    actors.push(...compact(await this.service.getActor(pendingIds)));

    return actorIds.map((id) => actors.find((a) => a.id === id));
  }
}

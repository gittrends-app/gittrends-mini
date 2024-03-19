import { each, mapSeries } from 'bluebird';
import { compact, difference } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Repository } from '@gittrends/entities';

import { Iterable, RepositoryResource, RepositoryResourceName, Service } from './Service';

export interface Cache<K extends Record<string, unknown>> {
  add(entity: K, scope: string): Promise<void>;
  delete(entity: K, scope: string): Promise<void>;
  get<T>(props: K, scope: string): Promise<T | undefined>;
}

type TCache = Cache<Partial<{ id: string; name: string }>>;

export class CachedService implements Service {
  private service: Service;
  private cache: TCache;

  constructor(service: Service, cache: TCache) {
    this.service = service;
    this.cache = cache;
  }

  async get(id: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get<Repository>({ id }, 'repositories');
    if (cachedValue) return cachedValue;

    return this.service.get(id).then(async (value) => {
      if (value) await this.cache.add(value, 'repositories');
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get<Repository>({ name }, 'repositories');
    if (cachedValue) return cachedValue;

    return this.service.find(name).then(async (value) => {
      if (value) await this.cache.add(value, 'repositories');
      return value;
    });
  }

  search?(opts: SearchComponentQuery): Iterable<Repository> {
    if (!this.service.search) throw new Error('Method not implemented on the provided service');
    return this.service.search(opts);
  }

  resources(
    repositoryId: string,
    resources: { resource: RepositoryResourceName; endCursor?: string; hasNextPage?: boolean }[],
  ): Iterable<RepositoryResource> {
    return this.service.resources(repositoryId, resources);
  }

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    const actorIds = Array.isArray(id) ? id : [id];

    const actors = compact(await mapSeries(actorIds, (id) => this.cache.get<Actor>({ id }, 'actors')));

    const pendingIds = difference(
      actorIds,
      actors.reduce((acc, a) => (a ? acc.concat(a.id) : acc), Array<string>()),
    );

    const response = await this.service.getActor(pendingIds).then(async (actors) => {
      await each(actors, (actor) => actor && this.cache.add(actor, 'actors'));
      return actors;
    });

    actors.push(...compact(response));

    return actorIds.map((id) => actors.find((a) => a.id === id));
  }
}

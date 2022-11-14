import { each } from 'bluebird';
import { compact, difference } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Node, Repository } from '@gittrends/entities';

import { Cache } from './Cache';
import { Iterable, IterableResources, Service } from './Service';

type TCache = Cache<Partial<Node & { name: string }>>;

export class CachedService implements Service {
  private service: Service;
  private cache: TCache;

  constructor(service: Service, cache: TCache) {
    this.service = service;
    this.cache = cache;
  }

  async get(id: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get({ id });
    if (cachedValue) return new Repository(cachedValue as any);

    return this.service.get(id).then(async (value) => {
      if (value) await this.cache.add(value);
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    const cachedValue = await this.cache.get({ name });
    if (cachedValue) return new Repository(cachedValue as any);

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
      resource: EntityPrototype<IterableResources>;
      endCursor?: string | undefined;
      hasNextPage?: boolean | undefined;
    }[],
  ): Iterable<IterableResources> {
    return this.service.resources(repositoryId, resources);
  }

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    const actorIds = Array.isArray(id) ? id : [id];

    const actors = compact(
      await Promise.all(actorIds.map((id) => this.cache.get({ id }).then((res) => res && Actor.from(res)))),
    );

    const pendingIds = difference(
      actorIds,
      actors.reduce((acc, a) => (a ? acc.concat(a.id) : acc), Array<string>()),
    );

    const response = await this.service.getActor(pendingIds).then(async (actors) => {
      await each(actors, (actor) => actor && this.cache.add(actor));
      return actors;
    });

    actors.push(...compact(response));

    return actorIds.map((id) => actors.find((a) => a.id === id));
  }
}

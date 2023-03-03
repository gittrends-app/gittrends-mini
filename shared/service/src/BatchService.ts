import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Repository } from '@gittrends/entities';

import { Iterable, IterableResources, Service } from './Service';

export class BatchService implements Service {
  private service: Service;
  private iterations: number;

  constructor(service: Service, iterations = 1) {
    this.service = service;
    this.iterations = Math.max(iterations, 1);
  }

  async get(id: string): Promise<Repository | undefined> {
    return this.service.get(id);
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.service.find(name);
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
    const iterator = this.service.resources(repositoryId, resources);

    const next = iterator.next.bind(iterator);

    iterator.next = async (...args: [] | [any]) => {
      let iteration = 0;

      const accumulator = resources.map<{
        items: IterableResources[];
        endCursor?: string;
        hasNextPage?: boolean;
      }>(() => ({ items: [] }), {});

      while (iteration++ < this.iterations) {
        const response = await next(...args);

        if (!response.done) {
          response.value.forEach((data, index) => {
            if (data.items.length > 0) {
              accumulator[index].items.push(...data.items);
              accumulator[index].endCursor = data.endCursor || accumulator[index].endCursor;
              accumulator[index].hasNextPage = data.hasNextPage;
            }
          });
        }
      }

      return {
        done: accumulator.reduce((acc, val) => acc + val.items.length, 0) === 0,
        value: accumulator,
      };
    };

    return iterator;
  }

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    return this.service.getActor(id);
  }
}

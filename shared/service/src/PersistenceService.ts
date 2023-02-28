import { compact } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Entity, Metadata, Repository, RepositoryResource } from '@gittrends/entities';

import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from './Repositories';
import { Iterable, IterableResources, Service } from './Service';

export type EntityRepositories = {
  get(Ref: Prototype<Actor>): IActorsRepository;
  get(Ref: Prototype<Repository>): IRepositoriesRepository;
  get(Ref: Prototype<Metadata>): IMetadataRepository;
  get<T extends Entity & RepositoryResource>(Ref: Prototype<T>): IResourceRepository<T>;
};

export class PersistenceService implements Service {
  private service: Service;
  private repositories: EntityRepositories;

  constructor(service: Service, persistence: EntityRepositories) {
    this.service = service;
    this.repositories = persistence;
  }

  async get(id: string): Promise<Repository | undefined> {
    return this.service.get(id).then(async (value) => {
      if (value) await this.repositories.get(Repository).upsert(value);
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.service.find(name).then(async (value) => {
      if (value) await this.repositories.get(Repository).insert(value);
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
      iterations?: number;
    }[],
  ): Iterable<IterableResources> {
    const iterator = this.service.resources(repositoryId, resources);

    const next = iterator.next.bind(iterator);

    const accumulator = resources.reduce<Record<string, { data: IterableResources[]; iteration: number }>>(
      (memo, { resource }) => ({
        ...memo,
        [resource.name]: { data: [], iteration: 0 },
      }),
      {},
    );

    iterator.next = async (...args: [] | [any]) => {
      return next(...args).then(async (response) => {
        if (!response.done) {
          for (const [index, { resource, iterations }] of resources.entries()) {
            const { items, endCursor, hasNextPage } = response.value[index];

            const resourceAcc = accumulator[resource.name];

            resourceAcc.data.push(...items);
            resourceAcc.iteration += 1;

            if (!iterations || resourceAcc.iteration === iterations || !hasNextPage) {
              await this.repositories.get(resource).insert(resourceAcc.data);

              await this.repositories.get(Metadata).upsert(
                new Metadata({
                  resource: resource.__name,
                  repository: repositoryId,
                  end_cursor: endCursor || resources[index].endCursor,
                  updated_at: new Date(),
                  finished_at: hasNextPage ? undefined : new Date(),
                }),
              );

              resourceAcc.data = [];
              resourceAcc.iteration = 0;
            }
          }
        }

        return response;
      });
    };

    return iterator;
  }

  getActor(id: string): Promise<Actor | undefined>;
  getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    return this.service.getActor(id).then(async (result) => {
      const persistable: Actor[] = [];
      if (Array.isArray(result)) {
        persistable.push(...compact(result));
      } else if (result !== undefined) {
        persistable.push(result);
      }

      if (persistable.length) {
        await this.repositories
          .get(Actor)
          .upsert(persistable.map((user) => Object.assign(user, { __updated_at: new Date() })));
      }

      return result;
    });
  }
}

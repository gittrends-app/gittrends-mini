import { compact } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github';

import type { Actor, Repository } from '@gittrends/entities';

import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from './Repositories';
import { Iterable, RepositoryResource, RepositoryResourceName, Service } from './Service';

export type EntityRepositories = {
  get(entity: 'actors'): IActorsRepository;
  get(entity: 'repositories'): IRepositoriesRepository;
  get(entity: 'metadata'): IMetadataRepository;
  get(entity: RepositoryResourceName): IResourceRepository<RepositoryResource>;
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
      if (value) await this.repositories.get('repositories').upsert(value);
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.service.find(name).then(async (value) => {
      if (value) await this.repositories.get('repositories').insert(value);
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
    const iterator = this.service.resources(repositoryId, resources);

    const next = iterator.next.bind(iterator);

    iterator.next = async (...args: [] | [any]) => {
      return next(...args).then(async (response) => {
        if (!response.done) {
          for (const [index, { resource }] of resources.entries()) {
            const { items, endCursor, hasNextPage } = response.value[index];

            await this.repositories.get(resource).insert(items);

            await this.repositories.get('metadata').upsert({
              resource: 'metadata',
              repository: repositoryId,
              end_cursor: endCursor || resources[index].endCursor,
              updated_at: new Date(),
              finished_at: hasNextPage ? undefined : new Date(),
            });
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
          .get('actors')
          .upsert(persistable.map((user) => Object.assign(user, { __updated_at: new Date() })));
      }

      return result;
    });
  }
}

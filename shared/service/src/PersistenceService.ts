import { compact } from 'lodash';

import { SearchComponentQuery } from '@gittrends/github/dist';

import { Actor, Metadata, Repository, RepositoryResource } from '@gittrends/entities';

import { IActorsRepository, IMetadataRepository, IRepositoriesRepository, IResourceRepository } from './Repositories';
import { Iterable, IterableRepositoryResources, Service } from './Service';

type RepositoriesOpts = {
  get(Ref: Prototype<Actor>): IActorsRepository;
  get(Ref: Prototype<Repository>): IRepositoriesRepository;
  get(Ref: Prototype<Metadata>): IMetadataRepository;
  get<T extends RepositoryResource>(Ref: Prototype<T>): IResourceRepository<T>;
};

export class PersistenceService implements Service {
  private service: Service;
  private repositories: RepositoriesOpts;

  constructor(service: Service, persistence: RepositoriesOpts) {
    this.service = service;
    this.repositories = persistence;
  }

  async get(id: string): Promise<Repository | undefined> {
    return this.service.get(id).then(async (value) => {
      if (value) await this.repositories.get(Repository).save(value);
      return value;
    });
  }

  async find(name: string): Promise<Repository | undefined> {
    return this.service.find(name).then(async (value) => {
      if (value) await this.repositories.get(Repository).save(value);
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
    const iterator = this.service.resources(repositoryId, resources);

    const next = iterator.next.bind(iterator);

    iterator.next = async (...args: [] | [any]) => {
      return next(...args).then(async (response) => {
        if (!response.done) {
          for (const [index, { resource }] of resources.entries()) {
            const { items, endCursor, hasNextPage } = response.value[index];

            await this.repositories.get(resource).save(items);

            await this.repositories.get(Metadata).upsert(
              new Metadata({
                resource: resource.__collection_name,
                repository: repositoryId,
                end_cursor: endCursor || resources[index].endCursor,
                updated_at: new Date(),
                finished_at: hasNextPage ? undefined : new Date(),
              }),
            );
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

      if (persistable.length) await this.repositories.get(Actor).save(persistable);

      return result;
    });
  }
}

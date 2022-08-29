import { omit } from 'lodash';
import PouchDB from 'pouchdb-browser';
import PouchFind from 'pouchdb-find';
import PouchUpsert from 'pouchdb-upsert';

import { Repository, RepositoryMetadata, Stargazer, User } from '../../types';
import { Iterable, Service } from './Service';

PouchDB.plugin(PouchFind).plugin(PouchUpsert);

type UserCollection = Omit<User, 'id'> & { _id: string };

type RepoCollection = Omit<Repository, 'id' | 'owner'> & {
  _id: string;
  owner: string;
};

type StargazerCollection = Omit<Stargazer, 'user'> & {
  _id: string;
  repository: string;
  user: string;
};

type MetadataCollection = RepositoryMetadata & { _id: string };

export class CacheService implements Service {
  private static collections = {
    user: new PouchDB<UserCollection>('actors'),
    repository: new PouchDB<RepoCollection>('repositories'),
    stargazer: new PouchDB<StargazerCollection>('stargazers'),
    metadata: new PouchDB<MetadataCollection>('metadata'),
  };

  static {
    Promise.all([
      CacheService.collections.repository.createIndex({
        index: { fields: ['name_with_owner'] },
      }),
      CacheService.collections.stargazer.createIndex({
        index: { fields: ['repository', 'starred_at'] },
      }),
    ]);

    setInterval(() => CacheService.collections.repository.compact(), 60 * 1000);
  }

  async find(name: string): Promise<Repository | null> {
    const { docs } = await CacheService.collections.repository.find({
      selector: { name_with_owner: { $regex: new RegExp(name, 'i') } },
      limit: 1,
    });

    const repo = docs.at(0);
    if (!repo) return null;

    const owner = await CacheService.collections.user.get(repo.owner);

    return omit(
      {
        id: repo._id,
        ...repo,
        owner: { ...omit(owner, ['_id', '_rev']), id: owner?._id },
      },
      ['_id', '_rev']
    );
  }

  stargazers(repositoryId: string): Iterable<Stargazer[]> {
    let hasNext: boolean = true;

    const limit = 500;
    let skip: number = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      hasNext: () => hasNext,
      async next() {
        if (!hasNext) return { done: true };

        const { docs } = await CacheService.collections.stargazer.find({
          selector: { repository: repositoryId },
          sort: ['repository', 'starred_at'],
          limit,
          skip,
        });

        skip += limit;
        hasNext = docs.length === limit;

        if (docs.length === 0) return { done: true };

        return {
          done: false,
          value: await Promise.all(
            docs.map(async (doc) => ({
              ...omit(doc, ['repository', '_id', '_rev']),
              user: await CacheService.collections.user
                .get(doc.user)
                .then((doc) => omit({ id: doc._id, ...doc }, ['_id', '_rev'])),
            }))
          ),
        };
      },
    };
  }

  async saveUsers(users: User[]) {
    return CacheService.collections.user.bulkDocs(users.map((user) => omit({ _id: user.id, ...user }, ['id'])));
  }

  async saveRepository(repos: Repository[]) {
    return Promise.all([
      this.saveUsers(repos.map((repo) => repo.owner)),
      Promise.all(
        repos.map((repo) =>
          CacheService.collections.repository.upsert(repo.id, (doc): any => ({
            ...doc,
            ...omit({ ...repo, owner: repo.owner?.id }, ['id']),
          }))
        )
      ),
    ]);
  }

  async saveStargazers(repositoryId: string, stargazers: Stargazer[]) {
    return Promise.all([
      this.saveUsers(stargazers.map((star) => star.user)),
      CacheService.collections.stargazer.bulkDocs(
        stargazers.map((star) => ({
          ...star,
          _id: `${repositoryId}.${star.user?.id}`,
          repository: repositoryId,
          user: star.user?.id,
        }))
      ),
    ]);
  }

  async getMetadata(repositoryId: string, resource: string) {
    return CacheService.collections.metadata.get(`${resource}.${repositoryId}`, { latest: true });
  }

  async saveMetadata(metadata: RepositoryMetadata) {
    return CacheService.collections.metadata.upsert(`${metadata.resource}.${metadata.repository}`, (doc): any => ({
      ...doc,
      ...metadata,
    }));
  }
}

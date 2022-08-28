import { get, omit } from 'lodash';
import { Estrela, Repositorio, RepositorioMetadata, Usuario } from '../types';
import { RepositoryComponent, SearchComponent } from './github/components';
import HttpClient from './github/HttpClient';
import Query from './github/Query';
import PouchDB from 'pouchdb-browser';
import PouchFind from 'pouchdb-find';
import PouchUpsert from 'pouchdb-upsert';

PouchDB.plugin(PouchFind).plugin(PouchUpsert);

interface Iterable {
  [Symbol.iterator](): Iterable;
  hasNext(): boolean;
  next(): Promise<{ done: boolean; value?: any }>;
  endCursor: string | undefined;
}

export interface Service {
  find(name: string): Promise<Repositorio | null>;
  stargazers(id: string): Iterable;
}

export class GitHubService implements Service {
  private httpClient: HttpClient;

  constructor(token: string) {
    this.httpClient = new HttpClient(token);
  }

  async find(name: string): Promise<Repositorio | null> {
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }).setAlias('search'))
      .run()
      .then((response) => get(response, ['search', 'nodes', 0]));
  }

  stargazers(repositoryId: string): Iterable {
    const self = this;
    let hasNextPage: boolean = true;

    return {
      [Symbol.iterator]() {
        return this;
      },

      hasNext() {
        return hasNextPage;
      },

      endCursor: undefined,

      async next() {
        if (!hasNextPage) return { done: true };

        return {
          done: false,
          value: await Query.create(self.httpClient)
            .compose(
              new RepositoryComponent(repositoryId)
                .setAlias('repository')
                .includeDetails(true)
                .includeStargazers(true, {
                  first: 100,
                  after: this.endCursor || undefined,
                  alias: '_stargazers',
                })
            )
            .run()
            .then((response) => {
              const pageInfo = get(
                response,
                'repository._stargazers.page_info'
              );
              hasNextPage = pageInfo?.has_next_page || false;
              this.endCursor = pageInfo?.end_cursor || this.endCursor;
              return get<Estrela[]>(
                response,
                'repository._stargazers.edges',
                []
              );
            }),
        };
      },
    };
  }
}

type UserCollection = Omit<Usuario, 'id'> & { _id: string };
type RepoCollection = Omit<Repositorio, 'id' | 'owner'> & {
  _id: string;
  owner: string;
};
type StargazerCollection = Omit<Estrela, 'user'> & {
  _id: string;
  repository: string;
  user: string;
};
type MetadataCollection = RepositorioMetadata & { _id: string };

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
      CacheService.collections.repository.compact(),
    ]);
  }

  async find(name: string): Promise<Repositorio | null> {
    const { docs } = await CacheService.collections.repository.find({
      selector: { name_with_owner: { $regex: new RegExp(name, 'i') } },
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

  stargazers(repositoryId: string) {
    let hasNext: boolean = true;

    const limit = 500;
    let skip: number = 0;

    return {
      [Symbol.iterator]() {
        return this;
      },
      endCursor: undefined,
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

  async saveUsers(users: Usuario[]) {
    return CacheService.collections.user.bulkDocs(
      users.map((user) => omit({ _id: user.id, ...user }, ['id']))
    );
  }

  async saveRepository(repos: Repositorio[]) {
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

  async saveStargazers(repositoryId: string, stargazers: Estrela[]) {
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
    return CacheService.collections.metadata.get(
      `${resource}.${repositoryId}`,
      { latest: true }
    );
  }

  async saveMetadata(metadata: RepositorioMetadata) {
    return CacheService.collections.metadata.upsert(
      `${metadata.resource}.${metadata.repository}`,
      (doc): any => ({ ...doc, ...metadata })
    );
  }
}

export class ProxyService implements Service {
  private cacheService: CacheService;
  private githubService: GitHubService;

  constructor(token: string) {
    this.cacheService = new CacheService();
    this.githubService = new GitHubService(token);
  }

  async find(name: string): Promise<Repositorio | null> {
    const cachedRepo = await this.cacheService.find(name);
    if (cachedRepo) cachedRepo;

    const repo = await this.githubService.find(name);
    if (repo) await this.cacheService.saveRepository([repo]);

    return repo;
  }

  stargazers(id: string): Iterable & { cacheHit?: boolean } {
    const self = this;

    const iterator = this.githubService.stargazers(id);
    const cachedIterator = this.cacheService.stargazers(id);

    let skipCache = false;

    return {
      [Symbol.iterator]() {
        return this;
      },
      endCursor: undefined,
      hasNext: iterator.hasNext,
      async next() {
        if (
          !skipCache &&
          (this.cacheHit === undefined || this.cacheHit === true)
        ) {
          if (this.cacheHit === undefined) {
            const meta = await self.cacheService
              .getMetadata(id, 'stargazers')
              .catch(() => null);

            if (meta) {
              this.cacheHit = true;
              this.endCursor = iterator.endCursor = meta.end_cursor;
            } else {
              this.cacheHit = false;
            }
          }

          if (this.cacheHit === true) {
            const { done, value } = await cachedIterator.next();
            if (!done) return { done: false, value };
          }

          skipCache = true;
        }

        const { done, value } = await iterator.next();

        this.endCursor = iterator.endCursor;

        if (value)
          await Promise.all([
            self.cacheService.saveStargazers(id, value),
            self.cacheService.saveMetadata({
              repository: id,
              resource: 'stargazers',
              end_cursor: iterator.endCursor,
              has_next_page: iterator.hasNext(),
            }),
          ]);

        return { done, value };
      },
    };
  }
}

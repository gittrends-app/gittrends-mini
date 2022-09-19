import { flatten, get, mapKeys, min, pick } from 'lodash';

import { Dependency, Release, Repository, RepositoryResource, Stargazer, Tag, Watcher } from '../../entities';
import HttpClient from '../../github/HttpClient';
import Query from '../../github/Query';
import { RepositoryComponent, SearchComponent, SearchComponentQuery } from '../../github/components';
import { RequestError, ServerRequestError } from '../../helpers/errors';
import { Constructor } from '../../types';
import { Iterable, Service } from '../Service';
import { ComponentBuilder } from './components/ComponentBuilder';
import { DependenciesComponentBuilder } from './components/DependenciesComponentBuilder';
import { ReleasesComponentBuilder } from './components/ReleasesComponentBuilder';
import { StargazersComponentBuilder } from './components/StargazersComponentBuilder';
import { TagsComponentBuilder } from './components/TagsComponentBuilder';
import { WatchersComponentBuilder } from './components/WatchersComponentBuilder';

async function request(
  httpClient: HttpClient,
  builders: ComponentBuilder[],
  error?: Error,
): Promise<ReturnType<ComponentBuilder['parse']>[]> {
  const components = builders.map((builder) => {
    const _component = builder.build(error);
    return Array.isArray(_component) ? _component : [_component];
  });

  try {
    const newAliases = components.map((ca, i) => ca.map((c, i2) => `${c.alias}__${i}_${i2}`));
    const componentsWithNewAliases = components.map((ca, i) => ca.map((c, i2) => c.setAlias(`${c.alias}__${i}_${i2}`)));

    const response = await Query.create(httpClient)
      .compose(...flatten(componentsWithNewAliases))
      .run()
      .finally(() => components.map((ca) => ca.map((comp) => comp.setAlias(comp.alias.replace(/__\d+_\d+$/i, '')))));

    const results = newAliases.map((na) => mapKeys(pick(response, na), (_, key) => key.replace(/__\d+_\d+$/i, '')));

    return builders.map((builder, i) => builder.parse(results[i]));
  } catch (error) {
    if (!(error instanceof RequestError)) throw error;
    if (builders.length === 1) return request(httpClient, builders, error as Error);
    return Promise.all(builders.map((builer) => request(httpClient, [builer]).then((res) => res[0])));
  }
}

function getComponentBuilder(Target: Constructor<RepositoryResource>) {
  if (Target === Stargazer) return StargazersComponentBuilder;
  else if (Target === Tag) return TagsComponentBuilder;
  else if (Target === Release) return ReleasesComponentBuilder;
  else if (Target === Watcher) return WatchersComponentBuilder;
  else if (Target === Dependency) return DependenciesComponentBuilder;
  throw new Error('No ComponentBuilder found for ' + Target.name);
}

class ResourceIterator implements Iterable {
  private readonly resourcesStatus: { hasMore: boolean; builder: ComponentBuilder; endCursor?: string }[];

  constructor(components: ComponentBuilder[], private httpClient: HttpClient) {
    this.resourcesStatus = components.map((component) => ({ hasMore: true, builder: component }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string | undefined }[]>> {
    const done = this.resourcesStatus.reduce((done, rs) => done && !rs.hasMore, true);

    if (done) return Promise.resolve({ done: true, value: undefined });

    const pendingResources = this.resourcesStatus.filter((rs) => rs.hasMore);

    const results = await request(
      this.httpClient,
      pendingResources.map((rs) => rs.builder),
    );

    results.forEach((result, index) => {
      pendingResources[index].hasMore = result?.hasNextPage;
      pendingResources[index].endCursor = result?.endCursor;
    });

    const value = this.resourcesStatus.map((rs) => {
      const index = pendingResources.findIndex((pr) => pr.builder === rs.builder);
      if (index < 0) return { items: [], endCursor: rs.endCursor };
      const result = results[index];
      return { items: result?.data, endCursor: result?.endCursor };
    });

    return { done: false, value };
  }
}

export class GitHubService implements Service {
  private httpClient: HttpClient;

  constructor(tokenOrClient: string | HttpClient) {
    if (tokenOrClient instanceof HttpClient) this.httpClient = tokenOrClient;
    else this.httpClient = new HttpClient(tokenOrClient);
  }

  async find(name: string): Promise<Repository | undefined> {
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }, { first: 1 }).setAlias('search'))
      .run()
      .then((response) =>
        Query.create(this.httpClient)
          .compose(
            new RepositoryComponent(get(response, ['search', 'nodes', 0, 'id']))
              .includeDetails(true)
              .includeLanguages(true, { first: 100 })
              .includeTopics(true, { first: 100 }),
          )
          .run(),
      )
      .then(
        ({ repository: { _languages, _topics, ...repo } }) =>
          new Repository({
            ...repo,
            languages: _languages?.edges,
            repository_topics: _topics?.nodes?.map((n: any) => n.topic),
          }),
      );
  }

  search({ limit, ...queryOpts }: SearchComponentQuery & { limit: number }): Iterable<Repository> {
    const { httpClient } = this;

    const cachedIds = new Set();
    let hasNextPage = true;
    let endCursor: string | undefined;
    let maxStargazers: number | undefined = queryOpts.maxStargazers;
    let first = 100;

    async function run(): Promise<any> {
      try {
        return await Query.create(httpClient)
          .compose(
            new SearchComponent(
              { ...queryOpts, maxStargazers },
              { after: endCursor, first: Math.min(first, limit - cachedIds.size) },
            ).setAlias('search'),
          )
          .run();
      } catch (error) {
        if (error instanceof ServerRequestError && first > 1) {
          first = Math.ceil(first / 2);
          return run();
        }
        throw error;
      }
    }

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (!hasNextPage || cachedIds.size >= limit) return { done: true, value: undefined };

        return run().then((result) => {
          hasNextPage = get<boolean>(result, 'search.page_info.has_next_page', false);
          endCursor = get<string | undefined>(result, 'search.page_info.end_cursor', endCursor);

          const repos = get<any[]>(result, 'search.nodes', []).map((data) => new Repository(data));
          const newRepos = repos.filter((repo) => !cachedIds.has(repo.id));

          if (repos.length === 0) return { done: true, value: undefined };

          repos.forEach((repo) => cachedIds.add(repo.id));
          first = Math.min(100, first * 2);

          if (!hasNextPage && repos.length === first) {
            hasNextPage = true;
            endCursor = undefined;
            maxStargazers = min(repos.map((repo) => repo.stargazers));
          }

          return { done: false, value: [{ items: newRepos, endCursor }] };
        });
      },
    };
  }

  resources(
    repositoryId: string,
    resources: { resource: Constructor<RepositoryResource>; endCursor?: string }[],
  ): Iterable {
    return new ResourceIterator(
      resources.map((res) => new (getComponentBuilder(res.resource))(repositoryId, res.endCursor)),
      this.httpClient,
    );
  }
}

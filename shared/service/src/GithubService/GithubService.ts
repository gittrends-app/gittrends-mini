import { mapSeries } from 'bluebird';
import { flatten, get, mapKeys, min, pick } from 'lodash';

import { HttpClient, Query, RepositoryComponent, SearchComponent, SearchComponentQuery } from '@gittrends/github';
import { RequestError, ServerRequestError } from '@gittrends/github';

import { Dependency, Release, Repository, RepositoryResource, Stargazer, Tag, Watcher } from '@gittrends/entities';
import { Issue, PullRequest } from '@gittrends/entities';
import { ExtendeableError } from '@gittrends/helpers';

import { Iterable, Service } from '../Service';
import { ComponentBuilder } from './ComponentBuilder';
import { DependenciesComponentBuilder } from './Components/DependenciesComponentBuilder';
import { IssuesComponentBuilder, PullRequestsComponentBuilder } from './Components/IssuesComponentBuilder';
import { ReleasesComponentBuilder } from './Components/ReleasesComponentBuilder';
import { StargazersComponentBuilder } from './Components/StargazersComponentBuilder';
import { TagsComponentBuilder } from './Components/TagsComponentBuilder';
import { WatchersComponentBuilder } from './Components/WatchersComponentBuilder';

class ServiceRequestError extends ExtendeableError {
  public readonly components: ComponentBuilder[];

  constructor(cause: Error, component: ComponentBuilder | ComponentBuilder[]) {
    const components = Array.isArray(component) ? component : [component];
    const parameters = components.map((c) => [c.constructor.name, c.toJSON()]);
    super(`${cause.message} <${JSON.stringify(parameters)}>`, cause);
    this.components = components;
  }
}

async function request(
  httpClient: HttpClient,
  builders: ComponentBuilder[],
): Promise<ReturnType<ComponentBuilder['parse']>[]> {
  const results = await (async function _request(builders: ComponentBuilder[], previousError?: Error): Promise<any> {
    const components = builders.map((builder) => {
      const _component = builder.build(previousError);
      return Array.isArray(_component) ? _component : [_component];
    });

    const newAliases = components.map((ca, i) => ca.map((c, i2) => `${c.alias}__${i}_${i2}`));
    const componentsWithNewAliases = components.map((ca, i) => ca.map((c, i2) => c.setAlias(`${c.alias}__${i}_${i2}`)));

    return Query.create(httpClient)
      .compose(...flatten(componentsWithNewAliases))
      .run()
      .then((response) =>
        newAliases.map((na) => mapKeys(pick(response, na), (_, key) => key.replace(/__\d+_\d+$/i, ''))),
      )
      .finally(() => components.map((ca) => ca.map((comp) => comp.setAlias(comp.alias.replace(/__\d+_\d+$/i, '')))))
      .catch(async (error) => {
        if (builders.length === 1) {
          if (!(error instanceof RequestError) || previousError) throw error;
          return _request(builders, error as Error);
        }
        const mappedResults = await mapSeries(builders, (builder) => _request([builder]));
        return flatten(mappedResults);
      });
  })(builders).catch((error) => {
    throw new ServiceRequestError(error as any, builders);
  });

  const parseResults = builders.map((builder, i) => builder.parse(results[i]));

  const partialResultsIndexes = parseResults.reduce(
    (indexes: number[], pr, index) =>
      pr.hasNextPage && (!pr.data || !pr.data.length) ? indexes.concat([index]) : indexes,
    [],
  );

  if (partialResultsIndexes.length > 0) {
    const finalPartialResults = await request(
      httpClient,
      builders.filter((_, index) => partialResultsIndexes.includes(index)),
    );
    partialResultsIndexes.forEach((prIndex, index) => (parseResults[prIndex] = finalPartialResults[index]));
  }

  return parseResults;
}

function getComponentBuilder(Target: Constructor<RepositoryResource>) {
  if (Target === Stargazer) return StargazersComponentBuilder;
  else if (Target === Tag) return TagsComponentBuilder;
  else if (Target === Release) return ReleasesComponentBuilder;
  else if (Target === Watcher) return WatchersComponentBuilder;
  else if (Target === Dependency) return DependenciesComponentBuilder;
  else if (Target === Issue) return IssuesComponentBuilder;
  else if (Target === PullRequest) return PullRequestsComponentBuilder;
  throw new Error('No ComponentBuilder found for ' + Target.name);
}

class ResourceIterator implements Iterable<RepositoryResource> {
  private readonly resourcesStatus: { hasMore: boolean; builder: ComponentBuilder; endCursor?: string }[];
  private errors?: ServiceRequestError[];

  constructor(components: ComponentBuilder[], private httpClient: HttpClient) {
    this.resourcesStatus = components.map((component) => ({ hasMore: true, builder: component }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string; hasNextPage: boolean }[]>> {
    const done = this.resourcesStatus.every((rs) => !rs.hasMore);

    if (done) {
      if (this.errors && this.errors.length) {
        throw new ServerRequestError(
          `Multiple errors: ${this.errors.map((e) => e.message).join(' -- ')}`,
          this.errors[0],
        );
      } else {
        return Promise.resolve({ done: true, value: undefined });
      }
    }

    const pendingResources = this.resourcesStatus.filter((rs) => rs.hasMore);

    const results = await request(
      this.httpClient,
      pendingResources.map((rs) => rs.builder),
    ).catch(async (error) => {
      if (!(error instanceof ServiceRequestError)) throw error;

      return flatten(
        await mapSeries(pendingResources, (pResource) =>
          request(this.httpClient, [pResource.builder]).catch((error) => {
            if (error instanceof ServiceRequestError) {
              pResource.hasMore = false;
              this.errors = (this.errors || []).concat([error]);
              return { hasNextPage: false, endCursor: pResource.endCursor, data: [] };
            }
            throw error;
          }),
        ),
      );
    });

    const value = this.resourcesStatus.map((rs) => {
      const index = pendingResources.findIndex((pr) => pr.builder === rs.builder);
      if (index < 0) return { items: [], endCursor: rs.endCursor, hasNextPage: rs.hasMore };
      const result = results[index];
      return {
        items: result.data,
        endCursor: (rs.endCursor = result.endCursor),
        hasNextPage: (rs.hasMore = result.hasNextPage),
      };
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

  async get(id: string): Promise<Repository | undefined> {
    return Query.create(this.httpClient)
      .compose(
        new RepositoryComponent(id)
          .setAlias('repository')
          .includeDetails(true)
          .includeLanguages(true, { first: 100 })
          .includeTopics(true, { first: 100 }),
      )
      .run()
      .then(
        ({ repository: { _languages, _topics, ...repo } }) =>
          new Repository({
            ...repo,
            languages: _languages?.edges,
            repository_topics: _topics?.nodes?.map((n: any) => n.topic),
          }),
      );
  }

  async find(name: string): Promise<Repository | undefined> {
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }, { first: 1 }).setAlias('search'))
      .run()
      .then((response) => this.get(get(response, ['search', 'nodes', 0, 'id'])));
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

          return { done: false, value: [{ items: newRepos, endCursor, hasNextPage }] };
        });
      },
    };
  }

  resources(repositoryId: string, resources: { resource: Constructor<RepositoryResource>; endCursor?: string }[]) {
    return new ResourceIterator(
      resources.map((res) => new (getComponentBuilder(res.resource))(repositoryId, res.endCursor)),
      this.httpClient,
    );
  }
}
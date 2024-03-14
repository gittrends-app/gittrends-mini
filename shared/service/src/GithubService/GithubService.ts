import { mapSeries } from 'bluebird';
import { chunk, flatten, get, mapKeys, min, pick } from 'lodash';
import { BaseError } from 'make-error-cause';

import {
  ActorComponent,
  GithubRequestError,
  HttpClient,
  Query,
  RepositoryComponent,
  RequestError,
  SearchComponent,
  SearchComponentQuery,
} from '@gittrends/github';
import { ServerRequestError } from '@gittrends/github';

import { Actor, Dependency, Release, Repository, Stargazer, Tag, Watcher } from '@gittrends/entities';
import { Issue, PullRequest } from '@gittrends/entities';
import { debug } from '@gittrends/helpers';

import { Iterable, IterableResources, Service } from '../Service';
import { ComponentBuilder } from './ComponentBuilder';
import { DependenciesComponentBuilder } from './Components/DependenciesComponentBuilder';
import { IssuesComponentBuilder, PullRequestsComponentBuilder } from './Components/IssuesComponentBuilder';
import { ReleasesComponentBuilder } from './Components/ReleasesComponentBuilder';
import { StargazersComponentBuilder } from './Components/StargazersComponentBuilder';
import { TagsComponentBuilder } from './Components/TagsComponentBuilder';
import { WatchersComponentBuilder } from './Components/WatchersComponentBuilder';

const logger = debug('github-service');

class ServiceRequestError extends BaseError {
  public readonly components: ComponentBuilder[];

  constructor(cause: Error, component: ComponentBuilder | ComponentBuilder[]) {
    const components = Array.isArray(component) ? component : [component];
    const parameters = components.map((c) => [c.constructor.name, c.toJSON()]);
    cause.message = `${cause.message} <${JSON.stringify(parameters)}> | Original message: ${cause.message}`;
    super(cause.message, cause);
    this.name = this.constructor.name;
    this.components = components;
  }
}

async function request(
  httpClient: HttpClient,
  builders: ComponentBuilder[],
): Promise<ReturnType<ComponentBuilder['parse']>[]> {
  const results = await (async function _request(builders: ComponentBuilder[], previousError?: Error): Promise<any> {
    logger(`requesting data from ${builders.length} resource(s)`);

    const components = builders.map((builder) => {
      const _component = builder.build(previousError);
      return Array.isArray(_component) ? _component : [_component];
    });

    const newAliases = components.map((ca, i) => ca.map((c, i2) => `${c.alias}__${i}_${i2}`));
    const componentsWithNewAliases = components.map((ca, i) => ca.map((c, i2) => c.setAlias(`${c.alias}__${i}_${i2}`)));

    return Query.create(httpClient)
      .compose(...flatten(componentsWithNewAliases))
      .run()
      .catch(async (error) => {
        // TODO - Refactor this when GitHub fix this issue
        if (builders.length === 1 && error instanceof RequestError && error.response?.data?.errors?.length) {
          const canIgnore: boolean = error.response?.data?.errors.every(
            (e: { type: string; message: string }) =>
              e.type === 'FORBIDDEN' &&
              e.message.toLocaleLowerCase().includes('you appear to have the correct authorization credentials'),
          );
          if (canIgnore) return get(error.response?.data, 'data', {});
        }
        throw error;
      })
      .then((response) =>
        newAliases.map((na) => mapKeys(pick(response, na), (_, key) => key.replace(/__\d+_\d+$/i, ''))),
      )
      .catch(async (error) => {
        logger(`error: ${error.message || error}`);
        if (builders.length === 1) {
          if (!previousError) return _request(builders, error as Error);
          throw error;
        }
        return flatten(await mapSeries(builders, (builder) => _request([builder])));
      })
      .finally(() => components.map((ca) => ca.map((comp) => comp.setAlias(comp.alias.replace(/__\d+_\d+$/i, '')))));
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
    logger('resultas are partial and more requests are needed');
    const finalPartialResults = await request(
      httpClient,
      builders.filter((_, index) => partialResultsIndexes.includes(index)),
    );
    partialResultsIndexes.forEach((prIndex, index) => (parseResults[prIndex] = finalPartialResults[index]));
  }

  return parseResults;
}

function getComponentBuilder(Target: EntityPrototype<IterableResources>) {
  if (Target === Stargazer) return StargazersComponentBuilder;
  else if (Target === Tag) return TagsComponentBuilder;
  else if (Target === Release) return ReleasesComponentBuilder;
  else if (Target === Watcher) return WatchersComponentBuilder;
  else if (Target === Dependency) return DependenciesComponentBuilder;
  else if (Target === Issue) return IssuesComponentBuilder;
  else if (Target === PullRequest) return PullRequestsComponentBuilder;
  throw new Error('No ComponentBuilder found for ' + Target);
}

class ResourceIterator implements Iterable<IterableResources> {
  private readonly resourcesStatus: { hasMore: boolean; builder: ComponentBuilder; endCursor?: string }[];
  private errors?: ServiceRequestError[];

  constructor(
    components: ComponentBuilder[],
    private httpClient: HttpClient,
  ) {
    this.resourcesStatus = components.map((component) => ({ hasMore: true, builder: component }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: IterableResources[]; endCursor?: string; hasNextPage: boolean }[]>> {
    const done = this.resourcesStatus.every((rs) => !rs.hasMore);

    if (done) {
      if (this.errors && this.errors.length) {
        if (this.errors.length === 1) throw this.errors[0];
        throw new ServerRequestError(new Error(`Multiple errors: ${this.errors.map((e) => e.message).join(' -- ')}`));
      } else {
        return Promise.resolve({ done: true, value: undefined });
      }
    }

    const pendingResources = this.resourcesStatus.filter((rs) => rs.hasMore);

    logger(`iterating over ${pendingResources.length} resource(s)`);

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
    logger(`requesting repository ${id}`);
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

  async getActor(id: string): Promise<Actor | undefined>;
  async getActor(ids: string[]): Promise<(Actor | undefined)[]>;
  async getActor(id: any): Promise<any> {
    const ids = Array.isArray(id) ? id : [id];

    logger(`requesting ${ids.length} actors`);

    if (ids.length > 15) return flatten(await mapSeries(chunk(ids, 15), (iChunk) => this.getActor(iChunk)));

    const components = ids.map((id, index) => new ActorComponent(id).setAlias(`actor_${index}`));

    const actors = await Query.create(this.httpClient)
      .compose(...components)
      .run()
      .then((result) => components.map((comp) => (result[comp.alias] ? Actor.from(result[comp.alias]) : undefined)))
      .catch(async (error) => {
        if (error instanceof Error && [GithubRequestError.name, ServerRequestError.name].includes(error.name)) {
          if (ids.length > 1)
            return flatten(await mapSeries(chunk(ids, ids.length / 2), (aChunk) => this.getActor(aChunk)));
          else return [undefined];
        }
        throw error;
      });

    return Array.isArray(id) ? actors : actors.at(0);
  }

  async find(name: string): Promise<Repository | undefined> {
    logger(`finding for repository with name ${name}`);
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }, { first: 1 }).setAlias('search'))
      .run()
      .then((response) => this.get(get(response, ['search', 'nodes', 0, 'id'])));
  }

  search({ limit, ...queryOpts }: SearchComponentQuery & { limit: number }): Iterable<Repository> {
    logger(`searching repositories with ${JSON.stringify({ limit, ...queryOpts })}`);

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
        const instanceofServerRequestError = error instanceof Error && error.name === ServerRequestError.name;

        if (instanceofServerRequestError && first > 1) {
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

  resources(repositoryId: string, resources: { resource: EntityPrototype<IterableResources>; endCursor?: string }[]) {
    return new ResourceIterator(
      resources.map((res) => new (getComponentBuilder(res.resource))(repositoryId, res.endCursor)),
      this.httpClient,
    );
  }
}

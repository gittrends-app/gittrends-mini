import { get } from 'lodash';

import { Release, Repository, RepositoryResource, Stargazer, Tag } from '../../entities';
import HttpClient from '../../github/HttpClient';
import Query from '../../github/Query';
import { SearchComponent } from '../../github/components';
import { RequestError } from '../../helpers/errors';
import { Constructor } from '../../types';
import { Iterable, Service } from '../Service';
import { ComponentBuilder } from './ComponentBuilder';
import { ReleasesComponentBuilder } from './ReleasesComponentBuilder';
import { StargazersComponentBuilder } from './StargazersComponentBuilder';
import { TagsComponentBuilder } from './TagsComponentBuilder';

async function request(
  httpClient: HttpClient,
  builders: ComponentBuilder[],
  error?: Error,
): Promise<ReturnType<ComponentBuilder['parse']>[]> {
  const components = builders.map((builder) => builder.build(error));

  try {
    const aliases = components.map((component) => component.alias);
    const componentsWithNewAliases = components.map((c, i) => c.setAlias(`${c.alias}__${i}`));
    const newAliases = componentsWithNewAliases.map((component) => component.alias);

    const response = await Query.create(httpClient)
      .compose(...componentsWithNewAliases)
      .run()
      .finally(() => components.map((comp, i) => comp.setAlias(aliases[i])));

    const results = newAliases.map((na) => get(response, na, {}));

    return builders.map((builder, i) => builder.parse(results.at(i)));
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
  throw new Error('No ComponentBuilder found for ' + Target.name);
}

class ResourceIterator implements Iterable {
  private readonly resourcesStatus;

  constructor(components: ComponentBuilder[], private httpClient: HttpClient) {
    this.resourcesStatus = components.map((component) => ({ hasMore: true, builder: component }));
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<{ items: RepositoryResource[]; endCursor?: string | undefined }[]>> {
    const done = this.resourcesStatus.reduce((done, rs) => done && !rs.hasMore, true);

    if (done) return Promise.resolve({ done: true, value: undefined });

    const results = await request(
      this.httpClient,
      this.resourcesStatus.map((rs) => rs.builder),
    );

    results.forEach((result, index) => (this.resourcesStatus[index].hasMore = result?.hasNextPage));

    return {
      done: false,
      value: results.map((result) => ({ items: result.data, endCursor: result.endCursor })),
    };
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
      .compose(new SearchComponent({ repo: name }, { first: 1, full: true }).setAlias('search'))
      .run()
      .then((response) => {
        const repo = get(response, ['search', 'nodes', 0]);
        if (repo) return new Repository(repo);
      });
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

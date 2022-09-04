import { get } from 'lodash';

import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { RepositoryComponent, SearchComponent } from '../github/components';
import { Repository, Stargazer } from '../types';
import { Iterable, Service } from './Service';

export class GitHubService implements Service {
  private httpClient: HttpClient;

  constructor(token: string) {
    this.httpClient = new HttpClient(token);
  }

  async find(name: string): Promise<Repository | null> {
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }, { first: 1, full: true }).setAlias('search'))
      .run()
      .then((response) => get(response, ['search', 'nodes', 0]));
  }

  stargazers(repositoryId: string, endCursor?: string): Iterable<Stargazer[]> {
    const createQuery = () => Query.create(this.httpClient);
    let hasNextPage: boolean = true;

    return {
      [Symbol.iterator]() {
        return this;
      },
      async next() {
        if (!hasNextPage) return { done: true };

        return {
          done: false,
          value: await createQuery()
            .compose(
              new RepositoryComponent(repositoryId)
                .setAlias('repository')
                .includeDetails(false)
                .includeStargazers(true, {
                  first: 100,
                  after: endCursor || undefined,
                  alias: '_stargazers',
                })
            )
            .run()
            .then((response) => {
              const pageInfo = get(response, 'repository._stargazers.page_info');
              hasNextPage = pageInfo?.has_next_page || false;
              endCursor = pageInfo?.end_cursor || endCursor;
              return get<Stargazer[]>(response, 'repository._stargazers.edges', []);
            }),
          endCursor,
        };
      },
    };
  }
}

import { get } from 'lodash';

import { Repository, Stargazer } from '../../types';
import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { RepositoryComponent, SearchComponent } from '../github/components';
import { Iterable, Service } from './Service';

export class GitHubService implements Service {
  private httpClient: HttpClient;

  constructor(token: string) {
    this.httpClient = new HttpClient(token);
  }

  async find(name: string): Promise<Repository | null> {
    return Query.create(this.httpClient)
      .compose(new SearchComponent({ repo: name }).setAlias('search'))
      .run()
      .then((response) => get(response, ['search', 'nodes', 0]));
  }

  stargazers(repositoryId: string): Iterable<Stargazer[]> {
    const createQuery = () => Query.create(this.httpClient);
    let hasNextPage: boolean = true;

    return {
      [Symbol.iterator]() {
        return this;
      },
      hasNext: () => hasNextPage,
      async next() {
        if (!hasNextPage) return { done: true };

        return {
          done: false,
          value: await createQuery()
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
              const pageInfo = get(response, 'repository._stargazers.page_info');
              hasNextPage = pageInfo?.has_next_page || false;
              this.endCursor = pageInfo?.end_cursor || this.endCursor;
              return get<Stargazer[]>(response, 'repository._stargazers.edges', []);
            }),
        };
      },
    };
  }
}

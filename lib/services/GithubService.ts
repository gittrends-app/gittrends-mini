import { get } from 'lodash';
import { Estrela, Repositorio } from '../../types';
import { RepositoryComponent, SearchComponent } from '../github/components';
import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { Service, Iterable } from './Service';

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
              const pageInfo = get(response, 'repository._stargazers.page_info');
              hasNextPage = pageInfo?.has_next_page || false;
              this.endCursor = pageInfo?.end_cursor || this.endCursor;
              return get<Estrela[]>(response, 'repository._stargazers.edges', []);
            }),
        };
      },
    };
  }
}

import { get } from 'lodash';

import Repository from '../entities/Repository';
import Stargazer from '../entities/Stargazer';
import HttpClient from '../github/HttpClient';
import Query from '../github/Query';
import { RepositoryComponent, SearchComponent } from '../github/components';
import { Iterable, Service } from './Service';

export class GitHubService implements Service {
  private httpClient: HttpClient;

  constructor(token: string) {
    this.httpClient = new HttpClient(token);
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

  stargazers(repositoryId: string, opts?: { endCursor?: string }): Iterable<Stargazer[] | undefined> {
    const createQuery = () => Query.create(this.httpClient);

    let endCursor = opts?.endCursor;
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
                  after: endCursor,
                  alias: '_stargazers',
                })
            )
            .run()
            .then((response) => {
              const pageInfo = get(response, 'repository._stargazers.page_info');
              hasNextPage = pageInfo?.has_next_page || false;
              endCursor = pageInfo?.end_cursor || endCursor;
              const data = get<[] | undefined>(response, 'repository._stargazers.edges', []);
              if (!data) return;
              else return data.map((data) => new Stargazer(data));
            }),
          endCursor,
        };
      },
    };
  }
}

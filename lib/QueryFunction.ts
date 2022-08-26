import ReposityComponent from './github/components/RepositoryComponent';
import HttpClient from './github/HttpClient';
import Query from './github/Query';

export class QueryFunction {
  client: HttpClient;
  component: ReposityComponent;

  constructor(tokenAuth: string, repositoryId: string, after?: string) {
    this.client = new HttpClient(tokenAuth);

    this.component = new ReposityComponent(repositoryId)
      .includeStargazers(true, { first: 100, after: after })
      .includeDetails(true);
  }

  runQuery() {
    return Query.create(this.client).compose(this.component).run();
  }
}

import { get } from 'lodash';

import { Stargazer } from '../../../entities';
import { RepositoryComponent } from '../../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

export class StargazersComponentBuilder implements ComponentBuilder<RepositoryComponent, Stargazer[]> {
  private first: number = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .includeDetails(false)
      .includeStargazers(true, { after: this.endCursor, first: this.first, alias: '_stars' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Stargazer[] } {
    return {
      hasNextPage: get(data, '_stars.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, '_stars.page_info.end_cursor', this.endCursor)),
      data: get<{ user: any; starred_at: Date }[]>(data, '_stars.edges', []).map(
        (data) => new Stargazer({ repository: this.repositoryId, user: data.user, starred_at: data.starred_at }),
      ),
    };
  }
}

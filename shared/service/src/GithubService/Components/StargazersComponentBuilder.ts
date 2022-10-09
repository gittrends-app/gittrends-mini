import { get } from 'lodash';

import { RepositoryComponent } from '@gittrends/github';

import { Stargazer } from '@gittrends/entities';

import { ComponentBuilder } from '../ComponentBuilder';

export class StargazersComponentBuilder implements ComponentBuilder<RepositoryComponent, Stargazer[]> {
  private first = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .setAlias('repo')
      .includeDetails(false)
      .includeStargazers(true, { after: this.endCursor, first: this.first, alias: 'stars' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Stargazer[] } {
    return {
      hasNextPage: get(data, 'repo.stars.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, 'repo.stars.page_info.end_cursor', this.endCursor)),
      data: get<{ user: any; starred_at: Date }[]>(data, 'repo.stars.edges', []).map(
        (data) => new Stargazer({ repository: this.repositoryId, user: data.user, starred_at: data.starred_at }),
      ),
    };
  }

  toJSON() {
    return { repository: this.repositoryId, endCursor: this.endCursor, first: this.first };
  }
}

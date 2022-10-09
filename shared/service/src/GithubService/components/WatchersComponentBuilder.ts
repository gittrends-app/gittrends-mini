import { get } from 'lodash';

import { RepositoryComponent } from '@gittrends/github';

import { Watcher } from '@gittrends/entities';

import { ComponentBuilder } from './ComponentBuilder';

export class WatchersComponentBuilder implements ComponentBuilder<RepositoryComponent, Watcher[]> {
  private first = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .setAlias('repo')
      .includeDetails(false)
      .includeWatchers(true, { after: this.endCursor, first: this.first, alias: 'watchers' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Watcher[] } {
    return {
      hasNextPage: get(data, 'repo.watchers.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, 'repo.watchers.page_info.end_cursor', this.endCursor)),
      data: get<any[]>(data, 'repo.watchers.nodes', []).map(
        (user) => new Watcher({ repository: this.repositoryId, user }),
      ),
    };
  }

  toJSON(): Record<string, unknown> {
    return { repository: this.repositoryId, first: this.first, endCursor: this.endCursor };
  }
}

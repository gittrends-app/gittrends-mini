import { get } from 'lodash';

import { Watcher } from '../../entities';
import { RepositoryComponent } from '../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

export class WatchersComponentBuilder implements ComponentBuilder<RepositoryComponent, Watcher[]> {
  private first: number = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .includeDetails(false)
      .includeWatchers(true, { after: this.endCursor, first: this.first, alias: '_watchers' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Watcher[] } {
    return {
      hasNextPage: get(data, '_watchers.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, '_watchers.page_info.end_cursor', this.endCursor)),
      data: get<any[]>(data, '_watchers.nodes', []).map((user) => new Watcher({ repository: this.repositoryId, user })),
    };
  }
}

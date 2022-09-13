import { get } from 'lodash';

import { Release, User } from '../../entities';
import { RepositoryComponent } from '../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

export class ReleasesComponentBuilder implements ComponentBuilder<RepositoryComponent, Release[]> {
  private first: number = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .includeDetails(false)
      .includeReleases(true, { after: this.endCursor, first: this.first, alias: '_releases' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Release[] } {
    return {
      hasNextPage: get(data, '_releases.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, '_releases.page_info.end_cursor', this.endCursor)),
      data: get<any[]>(data, '_releases.nodes', []).map(
        (target) =>
          new Release({
            repository: this.repositoryId,
            ...target,
            author: target.author && User.from(target.author),
          }),
      ),
    };
  }
}

import { get } from 'lodash';

import { Actor, Release } from '../../../entities';
import { RepositoryComponent } from '../../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

export class ReleasesComponentBuilder implements ComponentBuilder<RepositoryComponent, Release[]> {
  private first = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .setAlias('repo')
      .includeDetails(false)
      .includeReleases(true, { after: this.endCursor, first: this.first, alias: 'releases' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Release[] } {
    return {
      hasNextPage: get(data, 'repo.releases.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, 'repo.releases.page_info.end_cursor', this.endCursor)),
      data: get<any[]>(data, 'repo.releases.nodes', []).map(
        (node) => new Release({ ...node, repository: this.repositoryId, author: Actor.from(node.author) }),
      ),
    };
  }
}
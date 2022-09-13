import { get } from 'lodash';

import { Tag, User } from '../../entities';
import { RepositoryComponent } from '../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

export class TagsComponentBuilder implements ComponentBuilder<RepositoryComponent, Tag[]> {
  private first: number = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .includeDetails(false)
      .includeTags(true, { after: this.endCursor, first: this.first, alias: '_tags' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Tag[] } {
    return {
      hasNextPage: get(data, '_tags.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, '_tags.page_info.end_cursor', this.endCursor)),
      data: get<any[]>(data, '_tags.nodes', [])
        .map((node) => node.target)
        .map(
          (target) =>
            new Tag({
              id: target.id,
              message: target.message,
              name: target.name,
              oid: target.oid,
              repository: this.repositoryId,
              tagger: { ...target.tagger, ...(target.tagger.user ? { user: new User(target.tagger.user) } : {}) },
              target: target.target?.oid,
            }),
        ),
    };
  }
}

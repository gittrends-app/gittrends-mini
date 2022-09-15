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
    const parsedData = get<any[]>(data, '_tags.nodes', []).map((node) => {
      if (node.target.type === 'Tag') {
        const target = node.target;
        return new Tag({
          id: target.id,
          message: target.message,
          name: target.name,
          oid: target.oid,
          repository: this.repositoryId,
          tagger: { ...target.tagger, ...(target.tagger.user ? { user: new User(target.tagger.user) } : {}) },
          target: target.target?.oid,
        });
      } else {
        return new Tag({
          id: `commit_${node.target.id}`,
          message: node.target.message,
          name: node.name,
          oid: node.target.oid,
          repository: this.repositoryId,
          tagger: {
            ...node.target.author,
            ...(node.target.author?.user ? { user: new User(node.target.author.user) } : {}),
          },
          target: node.target.oid,
        });
      }
    });

    return {
      hasNextPage: get(data, '_tags.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, '_tags.page_info.end_cursor', this.endCursor)),
      data: parsedData,
    };
  }
}

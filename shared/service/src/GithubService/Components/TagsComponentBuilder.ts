import { get } from 'lodash';

import { RepositoryComponent } from '@gittrends/github';

import { Tag, User } from '@gittrends/entities';

import { ComponentBuilder } from '../ComponentBuilder';

export class TagsComponentBuilder implements ComponentBuilder<RepositoryComponent, Tag[]> {
  private first = 100;

  constructor(private repositoryId: string, private endCursor?: string) {}

  build(error?: Error): RepositoryComponent {
    if (error) throw error;

    return new RepositoryComponent(this.repositoryId)
      .setAlias('repo')
      .includeDetails(false)
      .includeTags(true, { after: this.endCursor, first: this.first, alias: 'tags' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Tag[] } {
    const parsedData = get<any[]>(data, 'repo.tags.nodes', []).map((node) => {
      if (node.target.type === 'Tag') {
        const target = node.target;
        return new Tag({
          id: target.id,
          message: target.message,
          name: target.name,
          oid: target.oid,
          repository: this.repositoryId,
          tagger: { ...target.tagger, ...(target.tagger?.user ? { user: new User(target.tagger?.user) } : {}) },
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
      hasNextPage: get(data, 'repo.tags.page_info.has_next_page', false),
      endCursor: (this.endCursor = get(data, 'repo.tags.page_info.end_cursor', this.endCursor)),
      data: parsedData,
    };
  }

  toJSON() {
    return { repository: this.repositoryId, endCursor: this.endCursor, first: this.first };
  }
}

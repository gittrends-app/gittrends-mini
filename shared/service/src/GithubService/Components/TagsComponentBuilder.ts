import { get } from 'lodash';

import { RepositoryComponent } from '@gittrends/github';

import { Actor, Entity, Tag } from '@gittrends/entities';

import { ComponentBuilder } from '../ComponentBuilder';

export class TagsComponentBuilder implements ComponentBuilder<RepositoryComponent, Tag[]> {
  private first = 100;

  constructor(
    private repositoryId: string,
    private endCursor?: string,
  ) {}

  build(error?: Error): RepositoryComponent {
    if (error) {
      if (this.first > 1) this.first = Math.floor(this.first / 2);
      else throw error;
    }

    return new RepositoryComponent(this.repositoryId)
      .setAlias('repo')
      .includeDetails(false)
      .includeTags(true, { after: this.endCursor, first: this.first, alias: 'tags' });
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Tag[] } {
    this.first = Math.min(100, this.first * 2);

    const parsedData = get<any[]>(data, 'repo.tags.nodes', []).map((node) => {
      if (node.target.type === 'Tag') {
        const target = node.target;
        return Entity.validate<Tag>({
          type: 'Tag',
          id: target.id,
          message: target.message,
          name: target.name,
          oid: target.oid,
          repository: this.repositoryId,
          tagger: target.tagger && {
            ...target.tagger,
            ...(target.tagger.user ? { user: Entity.validate<Actor>(target.tagger.user) } : {}),
          },
          target: target.target?.oid,
        });
      } else {
        return Entity.validate<Tag>({
          type: 'Tag',
          id: `commit_${node.target.id}`,
          message: node.target.message,
          name: node.name,
          oid: node.target.oid,
          repository: this.repositoryId,
          tagger: {
            ...node.target.author,
            ...(node.target.author?.user ? { user: Entity.validate<Actor>(node.target.author.user) } : {}),
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

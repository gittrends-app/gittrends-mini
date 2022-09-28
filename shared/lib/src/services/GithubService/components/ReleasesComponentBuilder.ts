import { get } from 'lodash';

import { Actor, Reaction, Release } from '../../../entities';
import { ReactionComponent, RepositoryComponent } from '../../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

enum Stages {
  GET_RELEASES,
  GET_REACTIONS,
}

export class ReleasesComponentBuilder implements ComponentBuilder<RepositoryComponent | ReactionComponent, Release[]> {
  private first = 100;
  private hasNextPage = true;
  private previousEndCursor?: string;
  private currentStage = Stages.GET_RELEASES;

  private releasesMeta: { release: Release; endCursor?: string; hasNextPage?: boolean }[] = [];

  constructor(private repositoryId: string, private endCursor?: string) {
    this.previousEndCursor = endCursor;
  }

  private get pendingReactables() {
    return this.releasesMeta.filter((meta) => meta.hasNextPage).slice(0, 25) || [];
  }

  build(error?: Error): RepositoryComponent | ReactionComponent[] {
    if (error) throw error;

    if (this.currentStage === Stages.GET_RELEASES) {
      return new RepositoryComponent(this.repositoryId)
        .setAlias('repo')
        .includeDetails(false)
        .includeReleases(true, { after: this.endCursor, first: this.first, alias: 'releases' });
    }

    if (this.currentStage === Stages.GET_REACTIONS) {
      return this.pendingReactables.map(({ release, endCursor }, index) =>
        new ReactionComponent(release.id, `reactable_${index}`).includeReactions(true, {
          first: 100,
          after: endCursor,
        }),
      );
    }

    throw new Error('Unknown stage: ' + Stages[this.currentStage]);
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Release[] } {
    if (this.currentStage === Stages.GET_RELEASES) {
      this.releasesMeta = get<any[]>(data, 'repo.releases.nodes', []).map((node) => ({
        release: new Release({
          ...node,
          repository: this.repositoryId,
          author: node.author && Actor.from(node.author),
          reactions: [],
        }),
        hasNextPage: true,
      }));

      this.hasNextPage = get<boolean>(data, 'repo.releases.page_info.has_next_page', false);
      this.endCursor = get(data, 'repo.releases.page_info.end_cursor', this.endCursor);
      this.currentStage = Stages.GET_REACTIONS;
    }

    if (this.currentStage === Stages.GET_REACTIONS) {
      this.pendingReactables.map((meta, index) => {
        const pageInfo = get(data, `reactable_${index}.reactions.page_info`, {});
        meta.endCursor = pageInfo.end_cursor || meta.endCursor;
        meta.hasNextPage = pageInfo.has_next_page || false;
        (meta.release.reactions as Reaction[]).push(
          ...get<any[]>(data, `reactable_${index}.reactions.nodes`, []).map(
            (rd) =>
              new Reaction({
                ...rd,
                repository: this.repositoryId,
                reactable: meta.release.id,
                reactable_type: meta.release.constructor.name,
              }),
          ),
        );
      });
    }

    if (this.pendingReactables.length === 0) {
      this.currentStage = Stages.GET_RELEASES;
      return {
        hasNextPage: this.hasNextPage,
        endCursor: this.endCursor,
        data: this.releasesMeta.map((rm) => rm.release),
      };
    }

    return { hasNextPage: true, endCursor: this.previousEndCursor, data: [] };
  }

  toJSON(): Record<string, unknown> {
    return {
      repository: this.repositoryId,
      currentStage: this.currentStage,
      first: this.first,
      endCursor: this.endCursor,
    };
  }
}

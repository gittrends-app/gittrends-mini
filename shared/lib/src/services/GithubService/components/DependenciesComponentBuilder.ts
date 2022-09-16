import { get } from 'lodash';

import { Dependency } from '../../../entities';
import Component from '../../../github/Component';
import { DependencyGraphManifestComponent, RepositoryComponent } from '../../../github/components';
import { ComponentBuilder } from './ComponentBuilder';

enum Stages {
  GET_MANIFESTS,
  GET_DEPENDENCIES,
}

export class DependenciesComponentBuilder implements ComponentBuilder<Component, Dependency[]> {
  private previousEndCursor: string | undefined;
  private currentStage: Stages = Stages.GET_MANIFESTS;

  private meta: Record<Stages, { first: number; endCursor?: string; hasNextPage?: boolean; data?: any[] }> = {
    [Stages.GET_MANIFESTS]: { first: 25 },
    [Stages.GET_DEPENDENCIES]: { first: 100 },
  };

  constructor(private repositoryId: string, endCursor?: string) {
    this.previousEndCursor = endCursor;
    this.meta[Stages.GET_MANIFESTS].endCursor = endCursor;
  }

  build(error?: Error): RepositoryComponent | DependencyGraphManifestComponent {
    if (error) throw error;

    if (this.currentStage === Stages.GET_MANIFESTS) {
      return new RepositoryComponent(this.repositoryId).includeDetails(false).includeDependencyManifests(true, {
        after: this.meta[this.currentStage].endCursor,
        first: this.meta[this.currentStage].first,
        alias: '_manifests',
      });
    }

    if (this.currentStage === Stages.GET_DEPENDENCIES) {
      return new DependencyGraphManifestComponent(this.meta[Stages.GET_MANIFESTS].data?.[0].id)
        .includeDetails(false)
        .includeDependencies(true, {
          after: this.meta[this.currentStage].endCursor,
          first: this.meta[this.currentStage].first,
        });
    }

    throw new Error('unknown stage');
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Dependency[] } {
    if (this.currentStage === Stages.GET_MANIFESTS) {
      const rec = this.meta[this.currentStage];
      rec.data = get<any[]>(data, '_manifests.nodes', []);
      rec.hasNextPage = get(data, '_manifests.page_info.has_next_page', false);
      rec.endCursor = get(data, '_manifests.page_info.end_cursor', (this.previousEndCursor = rec.endCursor));
      this.currentStage = Stages.GET_DEPENDENCIES;
      this.meta[Stages.GET_DEPENDENCIES].data = [];
      return { hasNextPage: rec.data.length > 0, endCursor: this.previousEndCursor, data: [] };
    }

    if (this.currentStage === Stages.GET_DEPENDENCIES) {
      const manifestsMeta = this.meta[Stages.GET_MANIFESTS];
      const manifest = manifestsMeta.data?.[0];
      const rec = this.meta[this.currentStage];
      rec.hasNextPage = get(data, 'dependencies.page_info.has_next_page', false);
      rec.endCursor = get(data, 'dependencies.page_info.end_cursor', rec.endCursor);
      rec.data?.push(
        ...get<any[]>(data, 'dependencies.nodes', []).map(
          (d) =>
            new Dependency({ ...d, manifest: manifest.id, repository: this.repositoryId, filename: manifest.filename }),
        ),
      );

      if (!rec.hasNextPage) {
        manifestsMeta.data?.splice(0, 1);
        this.currentStage = Stages.GET_DEPENDENCIES;
      }

      if (manifestsMeta.data?.length === 0) {
        return {
          hasNextPage: !!manifestsMeta.hasNextPage,
          endCursor: manifestsMeta.endCursor,
          data: rec.data as Dependency[],
        };
      }

      return { hasNextPage: true, endCursor: this.previousEndCursor, data: [] };
    }

    throw new Error(`Unknown Stage on ${this.constructor.name}`);
  }
}

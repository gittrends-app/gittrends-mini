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

  private manifestsMeta: { first: number; endCursor?: string; hasNextPage?: boolean } = { first: 25 };

  private dependenciesMeta: {
    manifest: any;
    first: number;
    endCursor?: string;
    hasNextPage: boolean;
    dependencies: Dependency[];
  }[] = [];

  private get pendingManifests() {
    return this.dependenciesMeta.filter((dm) => dm.hasNextPage !== false).slice(this.manifestsBatchSize);
  }

  private manifestsBatchSize = 5;

  constructor(private repositoryId: string, endCursor?: string) {
    this.previousEndCursor = endCursor;
    this.manifestsMeta.endCursor = endCursor;
  }

  build(error?: Error): RepositoryComponent | DependencyGraphManifestComponent[] {
    if (error) throw error;

    if (this.currentStage === Stages.GET_MANIFESTS) {
      return new RepositoryComponent(this.repositoryId)
        .setAlias('repo')
        .includeDetails(false)
        .includeDependencyManifests(true, {
          after: this.manifestsMeta.endCursor,
          first: this.manifestsMeta.first,
          alias: 'manifests',
        });
    }

    if (this.currentStage === Stages.GET_DEPENDENCIES) {
      return this.pendingManifests.map((pendingManifest) =>
        new DependencyGraphManifestComponent(pendingManifest.manifest.id)
          .includeDetails(false)
          .includeDependencies(true, { after: pendingManifest.endCursor, first: pendingManifest.first }),
      );
    }

    throw new Error('unknown stage');
  }

  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: Dependency[] } {
    if (this.currentStage === Stages.GET_MANIFESTS) {
      this.dependenciesMeta = get<any[]>(data, 'repo.manifests.nodes', []).map((manifest) => ({
        manifest,
        dependencies: [],
        first: 100,
        hasNextPage: true,
      }));

      this.manifestsMeta.hasNextPage = get(data, 'repo.manifests.page_info.has_next_page', false);
      this.manifestsMeta.endCursor = get(
        data,
        'repo.manifests.page_info.end_cursor',
        (this.previousEndCursor = this.manifestsMeta.endCursor),
      );

      this.currentStage = Stages.GET_DEPENDENCIES;

      return { hasNextPage: this.dependenciesMeta.length > 0, endCursor: this.previousEndCursor, data: [] };
    }

    if (this.currentStage === Stages.GET_DEPENDENCIES) {
      let hasNextPage = false;

      this.pendingManifests.forEach((pendingManifest) => {
        pendingManifest.hasNextPage = get(data, 'dependencies.page_info.has_next_page', false);
        pendingManifest.endCursor = get(data, 'dependencies.page_info.end_cursor', pendingManifest.endCursor);
        pendingManifest.dependencies.push(
          ...get<any[]>(data, 'dependencies.nodes', []).map(
            (d) =>
              new Dependency({
                ...d,
                manifest: pendingManifest.manifest.id,
                repository: this.repositoryId,
                filename: pendingManifest.manifest.filename,
              }),
          ),
        );

        hasNextPage = hasNextPage || pendingManifest.hasNextPage;
      });

      if (hasNextPage === false) {
        return {
          hasNextPage,
          endCursor: this.manifestsMeta.endCursor,
          data: this.dependenciesMeta.reduce((deps: Dependency[], dep) => deps.concat(dep.dependencies), []),
        };
      }

      return { hasNextPage: true, endCursor: this.previousEndCursor, data: [] };
    }

    throw new Error(`Unknown Stage on ${this.constructor.name}`);
  }
}

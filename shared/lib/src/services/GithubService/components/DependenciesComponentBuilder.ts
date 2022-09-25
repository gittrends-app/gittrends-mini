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

  private manifestsBatchSize = 5;

  private get pendingManifests() {
    return this.dependenciesMeta.filter((dm) => dm.hasNextPage === true).slice(0, this.manifestsBatchSize);
  }

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
      return this.pendingManifests.map((pendingManifest, index) =>
        new DependencyGraphManifestComponent(pendingManifest.manifest.id)
          .setAlias(`repo_${index}`)
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

      return { hasNextPage: this.pendingManifests.length > 0, endCursor: this.previousEndCursor, data: [] };
    }

    if (this.currentStage === Stages.GET_DEPENDENCIES) {
      this.pendingManifests.forEach((pendingManifest, index) => {
        pendingManifest.hasNextPage = get(data, `repo_${index}.dependencies.page_info.has_next_page`, false);
        pendingManifest.endCursor = get(
          data,
          `repo_${index}.dependencies.page_info.end_cursor`,
          pendingManifest.endCursor,
        );
        pendingManifest.dependencies.push(
          ...get<any[]>(data, `repo_${index}.dependencies.nodes`, []).map(
            (d) =>
              new Dependency({
                ...d,
                repository: this.repositoryId,
                manifest: pendingManifest.manifest.id,
                filename: pendingManifest.manifest.filename,
              }),
          ),
        );
      });

      if (this.dependenciesMeta.reduce((done, dm) => done && !dm.hasNextPage, true)) {
        this.currentStage = Stages.GET_MANIFESTS;
        return {
          hasNextPage: this.manifestsMeta.hasNextPage || false,
          endCursor: this.manifestsMeta.endCursor,
          data: this.dependenciesMeta.reduce((deps: Dependency[], dep) => deps.concat(dep.dependencies), []),
        };
      }

      return { hasNextPage: true, endCursor: this.previousEndCursor, data: [] };
    }

    throw new Error(`Unknown Stage on ${this.constructor.name}`);
  }
}
import { Component } from '@gittrends/github';

import { RepositoryResource } from '@gittrends/entities';

export interface ComponentBuilder<
  T extends Component = Component,
  E extends RepositoryResource[] = RepositoryResource[],
> {
  build(error?: Error): T | T[];
  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: E };
  toJSON(): { repository: string; endCursor?: string } & Record<string, unknown>;
}

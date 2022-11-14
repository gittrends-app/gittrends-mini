import { Component } from '@gittrends/github';

import { IterableResources } from '../Service';

export interface ComponentBuilder<
  T extends Component = Component,
  E extends IterableResources[] = IterableResources[],
> {
  build(error?: Error): T | T[];
  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: E };
  toJSON(): { repository: string; endCursor?: string } & Record<string, unknown>;
}

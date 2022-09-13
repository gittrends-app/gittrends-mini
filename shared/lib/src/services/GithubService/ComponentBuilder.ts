import { Entity, Release, Stargazer, Tag } from '../../entities';
import Component from '../../github/Component';
import { RepositoryComponent } from '../../github/components';

export interface ComponentBuilder<
  T extends Component = RepositoryComponent,
  E extends Entity[] = Stargazer[] | Tag[] | Release[],
> {
  build(error?: Error): T;
  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: E };
}

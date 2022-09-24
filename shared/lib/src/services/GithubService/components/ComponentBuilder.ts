import { RepositoryResource } from '../../../entities/interfaces/RepositoryResource';
import Component from '../../../github/Component';

export interface ComponentBuilder<
  T extends Component = Component,
  E extends RepositoryResource[] = RepositoryResource[],
> {
  build(error?: Error): T | T[];
  parse(data: any): { hasNextPage: boolean; endCursor?: string; data: E };
}

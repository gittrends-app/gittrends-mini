import { Repository } from '@gittrends/entities';

import { INodeRepository } from './NodeRepository';

export interface IRepositoriesRepository extends INodeRepository<Repository> {
  findByName(name: string): Promise<Repository | undefined>;
}

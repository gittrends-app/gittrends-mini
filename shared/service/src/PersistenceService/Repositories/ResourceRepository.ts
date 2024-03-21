import { Reaction, TimelineEvent } from '@gittrends/entities';

import { RepositoryResource } from '../../Service';
import { IEntityRepository } from './EntityRepository';

type PersistableResource = RepositoryResource | Reaction | TimelineEvent;

export interface IResourceRepository<T extends PersistableResource> extends IEntityRepository<T> {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<T[]>;
  countByRepository(repository: string): Promise<number>;
}

import { Metadata } from '@gittrends/entities';

import { IEntityRepository } from './EntityRepository';

export interface IMetadataRepository extends IEntityRepository<Metadata> {
  findByRepository(repository: string, resource?: Metadata['resource']): Promise<Metadata[]>;
}

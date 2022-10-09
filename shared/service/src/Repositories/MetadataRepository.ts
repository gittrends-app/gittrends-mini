import { Metadata } from '@gittrends/entities';

export interface IMetadataRepository {
  findByRepository(repository: string, resource?: Metadata['resource']): Promise<Metadata[]>;
  save(metadata: Metadata | Metadata[]): Promise<void>;
}

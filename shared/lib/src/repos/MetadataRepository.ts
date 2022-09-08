import { Metadata } from '../entities/Metadata';

export interface IMetadataRepository {
  findByRepository(repository: string, resource?: Metadata['resource']): Promise<Metadata[]>;
  save(metadata: Metadata | Metadata[]): Promise<void>;
}

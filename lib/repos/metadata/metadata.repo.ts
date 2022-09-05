import Metadata from '../../entities/Metadata';

export default interface IMetadataRepo {
  findByRepository(repository: string, resource?: Metadata['resource']): Promise<Metadata[]>;
  save(metadata: Metadata | Metadata[]): Promise<void>;
}

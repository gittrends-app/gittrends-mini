import { RepositoryMetadata, RepositoryResources } from '../../types';

export default interface IMetadataRepo {
  findByRepository(repository: string, resource?: RepositoryResources): Promise<RepositoryMetadata[]>;
  save(metadata: RepositoryMetadata | RepositoryMetadata[]): Promise<void>;
}

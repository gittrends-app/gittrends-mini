import { each } from 'bluebird';
import { omit } from 'lodash';

import { RepositoryMetadata, RepositoryResources } from '../../types';
import PouchDB from '../pouch.config';
import IMetadataRepo from './metadataRepo';

type MetadataCollection = RepositoryMetadata & { _id: string };

export default class MetadataRepository implements IMetadataRepo {
  private static collection = new PouchDB<MetadataCollection>('metadata', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['repository'] } });
  }

  async findByRepository(repository: string, resource?: RepositoryResources): Promise<RepositoryMetadata[]> {
    const { docs } = await MetadataRepository.collection.find({
      selector: { repository: repository, ...(resource ? { resource } : {}) },
      limit: 1,
    });

    return docs.map((meta) => omit({ ...meta, updated_at: new Date(meta.updated_at) }, ['_id', '_rev']));
  }

  async save(metadata: RepositoryMetadata | RepositoryMetadata[]): Promise<void> {
    const metas = Array.isArray(metadata) ? metadata : [metadata];

    await each(metas, (meta) =>
      MetadataRepository.collection.upsert(`${meta.repository}_${meta.resource}`, (doc): any => ({
        ...doc,
        ...meta,
      }))
    );
  }
}

import { each } from 'bluebird';
import { omit } from 'lodash';

import { Metadata } from '@gittrends/lib';
import { IMetadataRepository } from '@gittrends/lib';

import PouchDB from '../pouch.config';

type MetadataCollection = Omit<Metadata, 'toJSON'> & { _id: string };

export default class MetadataRepository implements IMetadataRepository {
  private static collection = new PouchDB<MetadataCollection>('metadata', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['repository'] } });
  }

  async findByRepository(repository: string, resource?: Metadata['resource']): Promise<Metadata[]> {
    const { docs } = await MetadataRepository.collection.find({
      selector: { repository: repository, ...(resource ? { resource } : {}) },
      limit: 1,
    });

    return docs.map((meta) => new Metadata(omit({ ...meta }, ['_id', '_rev']) as any));
  }

  async save(metadata: Metadata | Metadata[]): Promise<void> {
    const metas = Array.isArray(metadata) ? metadata : [metadata];

    await each(metas, (meta) =>
      MetadataRepository.collection.upsert(`${meta.repository}_${meta.resource}`, (doc): any => ({
        ...doc,
        ...meta.toJSON(),
      })),
    );
  }
}
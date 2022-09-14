import { map } from 'bluebird';
import { Knex } from 'knex';
import { omit, pick } from 'lodash';

import { IMetadataRepository, Metadata } from '@gittrends/lib';

import { parse } from '../helpers/sqlite';

export class MetadataRepository implements IMetadataRepository {
  constructor(private db: Knex) {}

  async findByRepository(repository: string, resource?: 'stargazers' | 'repository' | undefined): Promise<Metadata[]> {
    const metas = await this.db
      .table(Metadata.__collection_name)
      .select('*')
      .where({ repository, ...(resource ? { resource } : {}) });

    return metas.map((meta) => new Metadata(omit({ ...parse(meta), ...JSON.parse(meta.payload) }, 'payload') as any));
  }

  async save(metadata: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    await map(Array.isArray(metadata) ? metadata : [metadata], (meta) => {
      const fields = ['repository', 'resource', 'end_cursor', 'updated_at'];
      const command = this.db
        .table(Metadata.__collection_name)
        .insert({ ...pick(meta.toJSON(), fields), payload: JSON.stringify(omit(meta.toJSON(), fields)) })
        .onConflict(['repository', 'resource'])
        .merge();
      return trx ? command.transacting(trx) : command;
    });
  }
}

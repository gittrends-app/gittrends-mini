import { each } from 'bluebird';
import { Knex } from 'knex';
import { omit, pick, size } from 'lodash';

import { IMetadataRepository, Metadata } from '@gittrends/lib';

export class MetadataRepository implements IMetadataRepository {
  constructor(private db: Knex) {}

  async findByRepository(repository: string, resource?: 'stargazers' | 'repository' | undefined): Promise<Metadata[]> {
    const metas = await this.db
      .table(Metadata.__collection_name)
      .select('*')
      .where({ repository, ...(resource ? { resource } : {}) });

    return metas.map(
      (meta) => new Metadata(omit({ ...meta, ...(meta.payload && JSON.parse(meta.payload)) }, 'payload') as any),
    );
  }

  async save(metadata: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const metas = (Array.isArray(metadata) ? metadata : [metadata]).map((m) => m.toJSON('sqlite'));

    await each(metas, (meta) => {
      const fields = ['repository', 'resource', 'end_cursor', 'updated_at'];
      const payload = omit(meta, fields);
      return this.db
        .table(Metadata.__collection_name)
        .insert({ ...pick(meta, fields), payload: size(payload) > 0 ? JSON.stringify(payload) : undefined })
        .onConflict(['repository', 'resource'])
        .merge()
        .transacting(transaction);
    });

    if (!trx) await transaction.commit();
  }
}

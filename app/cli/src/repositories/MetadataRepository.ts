import { each } from 'bluebird';
import { Knex } from 'knex';

import { IMetadataRepository } from '@gittrends/service';

import { Metadata } from '@gittrends/entities';

export class MetadataRepository implements IMetadataRepository {
  constructor(private db: Knex) {}

  async findByRepository(repository: string, resource?: string): Promise<Metadata[]> {
    const metas = await this.db
      .table(Metadata.__collection_name)
      .select('*')
      .where({ repository, ...(resource ? { resource } : {}) });

    return metas.map(({ payload, ...meta }) => new Metadata({ ...meta, ...payload }));
  }

  async save(metadata: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    const transaction = trx || (await this.db.transaction());

    const metas = Array.isArray(metadata) ? metadata : [metadata];

    await each(metas, (meta) => {
      const { repository, resource, end_cursor, updated_at, ...payload } = meta;
      return this.db
        .table(Metadata.__collection_name)
        .insertEntity({ repository, resource, end_cursor, updated_at, payload: payload })
        .onConflict(['repository', 'resource'])
        .merge()
        .transacting(transaction);
    })
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }
}

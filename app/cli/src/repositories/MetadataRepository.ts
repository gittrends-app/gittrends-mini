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

  async save(metadata: Metadata | Metadata[], trx?: Knex.Transaction, upsert = false): Promise<void> {
    const metas = Array.isArray(metadata) ? metadata : [metadata];

    const transaction = trx || (await this.db.transaction());

    await each(metas, (meta) => {
      const { repository, resource, end_cursor, updated_at, finished_at, ...payload } = meta;
      return this.db
        .table(Metadata.__collection_name)
        .insertEntity({ repository, resource, end_cursor, updated_at, finished_at, payload: payload })
        .onConflict(['repository', 'resource'])
        ?.[upsert ? 'merge' : 'ignore']()
        .transacting(transaction);
    })
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  upsert(metadata: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    return this.save(metadata, trx, true);
  }
}

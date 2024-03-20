import { Knex } from 'knex';

import { IMetadataRepository } from '@gittrends/service';

import { Entity, Metadata } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';

export class MetadataRepository implements IMetadataRepository {
  constructor(private db: Knex) {}

  async findByRepository(repository: string, resource?: string): Promise<Metadata[]> {
    const metas = await this.db
      .table('metadata')
      .select('*')
      .where({ repository, ...(resource ? { resource } : {}) });

    return metas.map(({ payload, ...meta }) => Entity.metadata({ ...meta, ...payload }));
  }

  private async save(
    metadata: Metadata | Metadata[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const metas = Array.isArray(metadata) ? metadata : [metadata];

    const transaction = trx || (await this.db.transaction());

    await asyncIterator(metas, (meta) => {
      const { repository, resource, end_cursor, updated_at, finished_at, ...payload } = meta;
      return this.db
        .table('metadata')
        .insertEntity({ repository, resource, end_cursor, updated_at, finished_at, payload: payload })
        .onConflict(['repository', 'resource'])
        ?.[onConflict]()
        .transacting(transaction);
    })
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Metadata | Metadata[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

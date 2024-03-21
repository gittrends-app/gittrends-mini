import { Knex } from 'knex';
import { omit } from 'lodash';

import { IResourceRepository } from '@gittrends/service';

import { Dependency, Entity } from '@gittrends/entities';

import { asyncIterator } from '../config/knex.config';

export class DependenciesRepository implements IResourceRepository<Dependency> {
  constructor(private db: Knex) {}

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table('dependencies')
      .where('repository', repository)
      .count('repository', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Dependency[]> {
    const dependencies = await this.db
      .table('dependencies')
      .select('*')
      .where('repository', repository)
      .orderBy([
        { column: 'manifest', order: 'asc' },
        { column: 'filename', order: 'asc' },
        { column: 'package_name', order: 'asc' },
      ])
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return dependencies.map((dep) => Entity.dependency({ __type: 'Dependency', ...dep }));
  }

  private async save(
    dependency: Dependency | Dependency[],
    trx?: Knex.Transaction,
    onConflict: 'ignore' | 'merge' = 'ignore',
  ): Promise<void> {
    const dependencies = Array.isArray(dependency) ? dependency : [dependency];

    const transaction = trx || (await this.db.transaction());

    await asyncIterator(dependencies, (dep) =>
      this.db
        .table('dependencies')
        .insertEntity(omit(dep, ['__type']))
        .onConflict(['repository', 'manifest', 'package_name', 'requirements'])
        ?.[onConflict]()
        .transacting(transaction),
    )
      .then(async () => (!trx ? transaction.commit() : null))
      .catch(async (error) => {
        if (!trx) await transaction.rollback(error);
        throw error;
      });
  }

  insert(entity: Dependency | Dependency[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'ignore');
  }

  upsert(entity: Dependency | Dependency[], trx?: Knex.Transaction): Promise<void> {
    return this.save(entity, trx, 'merge');
  }
}

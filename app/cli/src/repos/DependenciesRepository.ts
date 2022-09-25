import { each } from 'bluebird';
import { Knex } from 'knex';

import { Dependency, IResourceRepository } from '@gittrends/lib';

export class DependenciesRepository implements IResourceRepository<Dependency> {
  constructor(private db: Knex) {}

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Dependency.__collection_name)
      .where('repository', repository)
      .count('*', { as: 'count' });
    return parseInt(count);
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Dependency[]> {
    const dependencies = await this.db
      .table(Dependency.__collection_name)
      .select('*')
      .where('repository', repository)
      .orderBy([
        { column: 'manifest', order: 'asc' },
        { column: 'filename', order: 'asc' },
        { column: 'package_name', order: 'asc' },
      ])
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return dependencies.map(
      (dep) =>
        new Dependency({ ...dep, target_repository: dep.target_repository && JSON.parse(dep.target_repository) }),
    );
  }

  async save(dependency: Dependency | Dependency[], trx?: Knex.Transaction): Promise<void> {
    const dependencies = Array.isArray(dependency) ? dependency : [dependency];

    const transaction = trx || (await this.db.transaction());

    await each(dependencies, (dep) =>
      this.db
        .table(Dependency.__collection_name)
        .insert(dep.toJSON('sqlite'))
        .onConflict(['repository', 'manifest', 'package_name', 'requirements'])
        .ignore()
        .transacting(transaction),
    );

    if (!trx) await transaction.commit();
  }
}

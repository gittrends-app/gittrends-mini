import { map } from 'bluebird';
import { Knex } from 'knex';

import { Dependency, IResourceRepository, Repository } from '@gittrends/lib';

import { parse, transform } from '../helpers/sqlite';

export class DependenciesRepository implements IResourceRepository<Dependency> {
  constructor(private db: Knex) {}

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Dependency.__collection_name)
      .where('repository', repository)
      .count('*', { as: 'count' });
    return count;
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
        new Dependency({
          ...parse(dep),
          target_repository: dep.target_repository && JSON.parse(dep.target_repository),
        }),
    );
  }

  async save(dependency: Dependency | Dependency[], trx?: Knex.Transaction): Promise<void> {
    const dependencies = Array.isArray(dependency) ? dependency : [dependency];

    const transaction = trx || (await this.db.transaction());

    await map(dependencies, (dep) =>
      this.db
        .table(Dependency.__collection_name)
        .insert({
          ...transform(dep),
          repository: dep.repository instanceof Repository ? dep.repository.id : dep.repository,
          target_repository: JSON.stringify(dep.target_repository),
        })
        .onConflict(['repository', 'manifest', 'package_name', 'requirements'])
        .ignore()
        .transacting(transaction),
    );

    if (!trx) await transaction.commit();
  }
}

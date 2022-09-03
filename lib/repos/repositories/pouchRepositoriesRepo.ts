import { each } from 'bluebird';
import { omit } from 'lodash';

import { Repository } from '../../types';
import ActorsRepository from '../actors/pouchActorsRepo';
import MetadataRepository from '../metadata/pouchMetadataRepo';
import PouchDB from '../pouch.config';
import IRepositoriesRepo from './repositoriesRepo';

type RepoCollection = Omit<Repository, 'id' | 'owner'> & {
  _id: string;
  owner: string;
};

export default class RepositoriesRepo implements IRepositoriesRepo {
  private static collection = new PouchDB<RepoCollection>('repositories', { auto_compaction: true });

  private actorsRepository = new ActorsRepository();
  private metadataRepository = new MetadataRepository();

  static {
    this.collection.createIndex({ index: { fields: ['name_with_owner'] } });
  }

  private async find(condition: Record<string, unknown>): Promise<Repository | undefined> {
    const { docs } = await RepositoriesRepo.collection.find({
      selector: condition,
      limit: 1,
    });

    const repo = docs.at(0);
    if (!repo) return undefined;

    return omit(
      {
        id: repo._id,
        ...repo,
        created_at: new Date(repo.created_at),
        pushed_at: new Date(repo.pushed_at),
        updated_at: new Date(repo.updated_at),
        owner: await this.actorsRepository.findById(repo.owner),
      },
      ['_id', '_rev']
    ) as Repository;
  }

  async findById(id: string): Promise<Repository | undefined> {
    return this.find({ _id: id });
  }

  findByName(name: string): Promise<Repository | undefined> {
    return this.find({ name_with_owner: { $regex: new RegExp(name, 'i') } });
  }

  async save(repo: Repository | Repository[]): Promise<void> {
    const repos = Array.isArray(repo) ? repo : [repo];

    await each(repos, async (repo) => {
      await Promise.all([
        this.actorsRepository.save(repos.map((repo) => repo.owner)),
        RepositoriesRepo.collection.upsert(repo.id, (doc): any => ({
          ...doc,
          ...omit({ ...repo, owner: repo.owner?.id }, ['id']),
        })),
      ]);

      await this.metadataRepository.save({ repository: repo.id, resource: 'repository', updated_at: new Date() });
    });
  }
}

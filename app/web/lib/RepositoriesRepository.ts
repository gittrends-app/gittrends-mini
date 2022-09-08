import { each } from 'bluebird';
import { omit } from 'lodash';

import { Metadata } from '@gittrends/lib';
import { IRepositoriesRepository } from '@gittrends/lib';
import { Repository } from '@gittrends/lib/dist/entities';

import ActorsRepository from './ActorsRepository';
import MetadataRepository from './MetadataRepository';
import PouchDB from './pouch.config';

type RepoCollection = Omit<Repository, 'id' | 'owner' | 'toJSON'> & {
  _id: string;
  owner: string;
};

export default class RepositoriesRepo implements IRepositoriesRepository {
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

    return new Repository({ id: repo._id, ...repo, owner: await this.actorsRepository.findById(repo.owner) });
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
      const ownerId = typeof repo.owner === 'string' ? repo.owner : repo.owner.id;
      await Promise.all([
        typeof repo.owner === 'string' ? null : this.actorsRepository.save(repo.owner),
        RepositoriesRepo.collection.upsert(repo.id, (doc): any => ({
          ...doc,
          ...omit({ ...repo.toJSON(), owner: ownerId }, ['id']),
        })),
      ]);

      await this.metadataRepository.save(
        new Metadata({ repository: repo.id, resource: 'repository', updated_at: new Date() }),
      );
    });
  }
}

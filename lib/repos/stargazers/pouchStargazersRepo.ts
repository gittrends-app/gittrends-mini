import { map } from 'bluebird';
import { omit } from 'lodash';

import { Repository, Stargazer, User } from '../../types';
import ActorsRepository from '../actors/pouchActorsRepo';
import MetadataRepository from '../metadata/pouchMetadataRepo';
import PouchDB from '../pouch.config';
import IStargazersRepository from './stargazersRepo';

type StargazerCollection = Omit<Stargazer, 'user'> & {
  _id: string;
  repository: string;
  user: string;
};

export default class StargazersRepository implements IStargazersRepository {
  private static collection = new PouchDB<StargazerCollection>('stargazers', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['repository', 'starred_at'] } });
  }

  private readonly actorsRepo = new ActorsRepository();
  private readonly metadataRepository = new MetadataRepository();

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Stargazer[]> {
    const { docs } = await StargazersRepository.collection.find({
      selector: { repository: repository },
      sort: [{ repository: 'asc' }, { starred_at: 'asc' }],
      limit: opts?.limit || 100,
      skip: opts?.skip || 0,
    });

    return map(docs, async (doc) => {
      const user = await this.actorsRepo.findById(doc.user);
      return omit({ ...doc, starred_at: new Date(doc.starred_at), user: user as User }, ['_id', '_rev', 'repository']);
    });
  }
  async save(
    stargazer: Stargazer | Stargazer[],
    opts: { repository: Repository | string; endCursor: string }
  ): Promise<void> {
    const repoId = typeof opts.repository === 'string' ? opts.repository : opts.repository.id;
    const stargazers = Array.isArray(stargazer) ? stargazer : [stargazer];

    await Promise.all([
      this.actorsRepo.save(stargazers.map((star) => star.user)),
      StargazersRepository.collection.bulkDocs(
        stargazers.map((star) => ({
          ...star,
          _id: `${repoId}.${star.user?.id}`,
          repository: repoId,
          user: star.user?.id,
        }))
      ),
    ]);

    await this.metadataRepository.save({
      repository: repoId,
      resource: 'stargazers',
      end_cursor: opts.endCursor,
      updated_at: new Date(),
    });
  }
}

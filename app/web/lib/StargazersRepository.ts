import { map } from 'bluebird';

import { Actor, Metadata, Repository, Stargazer } from '@gittrends/lib';
import { IStargazersRepository } from '@gittrends/lib';

import ActorsRepository from './ActorsRepository';
import MetadataRepository from './MetadataRepository';
import PouchDB from './pouch.config';

type StargazerCollection = Omit<Stargazer, 'user' | 'toJSON'> & {
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

    return map(docs, async (doc) => new Stargazer({ ...doc, user: await this.actorsRepo.findById(doc.user) }));
  }
  async save(
    stargazer: Stargazer | Stargazer[],
    opts: { repository: Repository | string; endCursor: string },
  ): Promise<void> {
    const repoId = opts.repository instanceof Repository ? opts.repository.id : opts.repository;
    const stargazers = Array.isArray(stargazer) ? stargazer : [stargazer];

    await Promise.all([
      this.actorsRepo.save(
        stargazers.reduce<Actor[]>((memo, star) => (star.user instanceof Actor ? memo.concat([star.user]) : memo), []),
      ),
      StargazersRepository.collection.bulkDocs(
        stargazers.map((star) => {
          const userId = star.user instanceof Actor ? star.user.id : star.user;

          return {
            ...(star.toJSON() as any),
            _id: `${repoId}.${userId}`,
            repository: repoId,
            user: userId,
          };
        }),
      ),
    ]);

    await this.metadataRepository.save(
      new Metadata({
        repository: repoId,
        resource: 'stargazers',
        end_cursor: opts.endCursor,
        updated_at: new Date(),
      }),
    );
  }
}

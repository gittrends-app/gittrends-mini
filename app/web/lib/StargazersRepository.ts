import { map } from 'bluebird';

import { Actor, Repository, Stargazer } from '@gittrends/lib';
import { IResourceRepository } from '@gittrends/lib';

import PouchDB from '../pouch.config';
import ActorsRepository from './ActorsRepository';
import MetadataRepository from './MetadataRepository';

type StargazerCollection = Omit<Stargazer, 'user' | 'toJSON'> & {
  _id: string;
  repository: string;
  user: string;
};

export default class StargazersRepository implements IResourceRepository<Stargazer> {
  private static collection = new PouchDB<StargazerCollection>('stargazers', { auto_compaction: true });

  static {
    this.collection.createIndex({ index: { fields: ['repository', 'starred_at'] } });
  }

  private readonly actorsRepo = new ActorsRepository();

  async countByRepository(repository: string): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Stargazer[]> {
    const { docs } = await StargazersRepository.collection.find({
      selector: { repository: repository },
      sort: [{ repository: 'asc' }, { starred_at: 'asc' }],
      limit: opts?.limit || 100,
      skip: opts?.skip || 0,
    });

    return map(docs, async (doc) => new Stargazer({ ...doc }));
  }
  async save(stargazer: Stargazer | Stargazer[]): Promise<void> {
    const stargazers = Array.isArray(stargazer) ? stargazer : [stargazer];

    await Promise.all([
      this.actorsRepo.save(
        stargazers.reduce<Actor[]>((memo, star) => (star.user instanceof Actor ? memo.concat([star.user]) : memo), []),
      ),
      StargazersRepository.collection.bulkDocs(
        stargazers.map((star) => {
          const repoId = star.repository instanceof Repository ? star.repository.id : star.repository;
          const userId = star.user instanceof Actor ? star.user.id : star.user;
          return { ...(star.toJSON() as any), _id: `${repoId}.${userId}`, repository: repoId, user: userId };
        }),
      ),
    ]);
  }
}

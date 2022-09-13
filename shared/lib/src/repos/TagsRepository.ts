import { Tag } from '../entities/Tag';

export interface ITagsRepository {
  findByRepository(repository: string, opts?: { limit: number; skip: number }): Promise<Tag[]>;
  save(tags: Tag | Tag[]): Promise<void>;
}

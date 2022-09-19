import { all, map } from 'bluebird';
import { Knex } from 'knex';

import { Actor, IResourceRepository, Repository, Tag, User } from '@gittrends/lib';

import { parse } from '../helpers/sqlite';
import { ActorsRepository } from './ActorRepository';

export class TagsRepository implements IResourceRepository<Tag> {
  private actorsRepo: ActorsRepository;

  constructor(private db: Knex) {
    this.actorsRepo = new ActorsRepository(db);
  }

  async countByRepository(repository: string): Promise<number> {
    const [{ count }] = await this.db
      .table(Tag.__collection_name)
      .where('repository', repository)
      .count('id', { as: 'count' });
    return count;
  }

  async findByRepository(repository: string, opts?: { limit: number; skip: number } | undefined): Promise<Tag[]> {
    const tags = await this.db
      .table('tags')
      .select('*')
      .where('repository', repository)
      .orderBy('name', 'asc')
      .limit(opts?.limit || 1000)
      .offset(opts?.skip || 0);

    return tags.map((star) => new Tag(parse({ ...star, tagger: star.tagger && JSON.parse(star.tagger) })));
  }

  async save(tag: Tag | Tag[], trx?: Knex.Transaction): Promise<void> {
    const tags = Array.isArray(tag) ? tag : [tag];

    const transaction = trx || (await this.db.transaction());

    const { users: _users, tags: _tags } = tags.reduce(
      (memo, tag) =>
        tag.tagger.user instanceof User
          ? {
              users: memo.users.concat([tag.tagger.user]),
              tags: memo.tags.concat(new Tag({ ...tag, tagger: { ...tag.tagger, user: tag.tagger.user.id } })),
            }
          : {
              ...memo,
              tags: memo.tags.concat(tag),
            },
      { users: [] as Actor[], tags: [] as Tag[] },
    );

    await all([
      this.actorsRepo.save(_users, transaction),
      map(_tags, (tag) =>
        this.db
          .table(Tag.__collection_name)
          .insert({
            ...tag,
            repository: tag.repository instanceof Repository ? tag.repository.id : tag.repository,
            tagger: tag.tagger && JSON.stringify(tag.tagger),
          })
          .onConflict(['id'])
          .ignore()
          .transacting(transaction),
      ),
    ]);

    if (!trx) transaction.commit();
  }
}

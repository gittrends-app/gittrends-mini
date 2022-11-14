import { Entity, Node } from '@gittrends/entities';

import { IEntityRepository } from './EntityRepository';

export interface INodeRepository<T extends Entity & Node> extends IEntityRepository<T> {
  findById(id: string): Promise<T | undefined>;
  findById(id: string | string[]): Promise<(T | undefined)[]>;
}

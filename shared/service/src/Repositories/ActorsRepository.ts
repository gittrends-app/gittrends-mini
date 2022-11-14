import { Actor } from '@gittrends/entities';

import { INodeRepository } from './NodeRepository';

export interface IActorsRepository extends INodeRepository<Actor> {
  findByLogin(login: string): Promise<Actor | undefined>;
}

/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class BaseRefForcePushedEvent extends Fragment {
  code = 'baseRefForcePushedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on BaseRefForcePushedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        afterCommit { id:oid }
        beforeCommit { id:oid }
        createdAt
        ref { name target { id } }
      }
    `;
  }
}

export default new BaseRefForcePushedEvent();

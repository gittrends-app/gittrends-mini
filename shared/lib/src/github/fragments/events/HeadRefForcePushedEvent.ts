/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class HeadRefForcePushedEvent extends Fragment {
  code = 'headRefForcePushedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on HeadRefForcePushedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        afterCommit { id:oid }
        beforeCommit { id:oid }
        createdAt
        ref { name target { id } }
      }
    `;
  }
}

export default new HeadRefForcePushedEvent();

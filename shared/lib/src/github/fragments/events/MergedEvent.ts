/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class MergedEvent extends Fragment {
  code = 'mergedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on MergedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        commit { id:oid }
        createdAt
        mergeRef { name target { id } }
        mergeRefName
      }
    `;
  }
}

export default new MergedEvent();

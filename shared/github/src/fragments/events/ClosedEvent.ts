/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class ClosedEvent extends Fragment {
  code = 'closedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ClosedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        closer {
          __typename
          ... on Node { id }
          ... on Commit { commit:oid }
        }
        createdAt
        stateReason
      }
    `;
  }
}

export default new ClosedEvent();

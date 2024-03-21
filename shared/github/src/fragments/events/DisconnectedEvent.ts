/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class DisconnectedEvent extends Fragment {
  code = 'disconnectedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DisconnectedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        isCrossRepository
        source {
          ... on Issue { id __typename }
          ... on PullRequest { id __typename }
        }
        subject {
          ... on Issue { id __typename }
          ... on PullRequest { id __typename }
        }
      }
    `;
  }
}

export default new DisconnectedEvent();

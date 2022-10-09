/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

export class DeploymentFragment extends Fragment {
  code = 'deployment';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on Deployment {
        commit { id:oid }
        createdAt
        creator { ...${SimplifiedActorFragment.code} }
        databaseId
        environment
        id
        payload
        state
        statuses (last: 100) {
          nodes {
            creator { ...${SimplifiedActorFragment.code} }
            description
            environmentUrl
            id
            logUrl
            state
          }
        }
      }
    `;
  }
}

export default new DeploymentFragment();

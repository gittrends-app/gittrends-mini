/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class DeployedEvent extends Fragment {
  code = 'deployedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DeployedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        deployment { id }
        ref { name target { id } }
      }
    `;
  }
}

export default new DeployedEvent();

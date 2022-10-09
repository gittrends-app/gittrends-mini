/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class DeploymentEnvironmentChangedEvent extends Fragment {
  code = 'deploymentEnvironmentChangedEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on DeploymentEnvironmentChangedEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        deploymentStatus { id }
      }
    `;
  }
}

export default new DeploymentEnvironmentChangedEvent();

/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../../Fragment';
import { SimplifiedActorFragment } from '../ActorFragment';

export class ConvertedToDiscussionEvent extends Fragment {
  code = 'convertToDraftEvent';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on ConvertedToDiscussionEvent {
        actor { ...${SimplifiedActorFragment.code} }
        createdAt
        discussion { id }
      }
    `;
  }
}

export default new ConvertedToDiscussionEvent();

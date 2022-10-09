/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';

export class TagFragment extends Fragment {
  code = 'tag';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment];
  }

  toString(): string {
    return `
    fragment ${this.code} on Tag {
      id
      message
      name
      oid
      tagger { date email name user { ...${SimplifiedActorFragment.code} } }
      target { id:oid }
    }
    `;
  }
}

export default new TagFragment();

/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import ReactableFragment from './ReactableFragment';

export class ReleaseFragment extends Fragment {
  code = 'release';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, ReactableFragment];
  }

  toString(): string {
    return `
    fragment ${this.code} on Release {
      author { ...${SimplifiedActorFragment.code} }
      createdAt
      description
      id
      isDraft
      isLatest
      isPrerelease
      mentions { totalCount }
      name
      publishedAt
      ...${ReactableFragment.code}
      releaseAssets { totalCount }
      tag { id }
      tagCommit { id:oid }
      tagName
      updatedAt
    }
    `;
  }
}

export default new ReleaseFragment();

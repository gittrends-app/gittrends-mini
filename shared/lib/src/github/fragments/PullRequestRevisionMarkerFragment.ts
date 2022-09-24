/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';

export class PullRequestRevisionMarkerFragment extends Fragment {
  code = 'pullRequestRevisionMarker';

  get dependencies(): Fragment[] {
    return [];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestRevisionMarker {
        createdAt
        lastSeenCommit { id:oid }
      }
    `;
  }
}

export default new PullRequestRevisionMarkerFragment();

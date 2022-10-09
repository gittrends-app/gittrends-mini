/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';

export class PullRequestCommitFragment extends Fragment {
  code = 'pullRequestCommit';

  get dependencies(): Fragment[] {
    return [];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestCommit {
        commit { id:oid }
      }
    `;
  }
}

export default new PullRequestCommitFragment();

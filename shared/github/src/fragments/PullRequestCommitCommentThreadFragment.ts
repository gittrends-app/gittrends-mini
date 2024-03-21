/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommitCommentFragment from './CommitCommentFragment';

export class PullRequestCommitCommentThreadFragment extends Fragment {
  code = 'pullRequestCommitCommentThread';

  get dependencies(): Fragment[] {
    return [CommitCommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestCommitCommentThread {
        __typename
        comments(first: 100) { nodes { ...${CommitCommentFragment.code} } }
        commit { id:oid }
        path
        position
      }
    `;
  }
}

export default new PullRequestCommitCommentThreadFragment();

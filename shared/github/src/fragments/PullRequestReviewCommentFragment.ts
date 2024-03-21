/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommentFragment from './CommentFragment';
import ReactableFragment from './ReactableFragment';

export class PullRequestReviewCommentFragment extends Fragment {
  code = 'pullRequestReviewComment';

  get dependencies(): Fragment[] {
    return [CommentFragment, ReactableFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestReviewComment {
        id
        __typename
        ... on Comment { ...${CommentFragment.code} }
        commit { id:oid }
        databaseId
        diffHunk
        draftedAt
        isMinimized
        minimizedReason
        originalCommit { id:oid }
        originalPosition
        outdated
        path
        position
        ...${ReactableFragment.code}
        replyTo { id }
        state
      }
    `;
  }
}

export default new PullRequestReviewCommentFragment();

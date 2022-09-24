/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import PullRequestReviewCommentFragment from './PullRequestReviewCommentFragment';
import ReactableFragment from './ReactableFragment';

export class PullRequestReviewFragment extends Fragment {
  code = 'pullRequestReview';

  get dependencies(): Fragment[] {
    return [SimplifiedActorFragment, ReactableFragment, PullRequestReviewCommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on PullRequestReview {
        type:__typename
        author { ...${SimplifiedActorFragment.code} }
        authorAssociation
        authorCanPushToRepository
        body
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment.code} } }
        commit { id:oid }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${SimplifiedActorFragment.code} }
        lastEditedAt
        publishedAt
        ...${ReactableFragment.code}
        state
        submittedAt
        updatedAt
      }
    `;
  }
}

export default new PullRequestReviewFragment();

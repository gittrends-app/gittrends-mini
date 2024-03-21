/*
 *  Author: Hudson S. Borges
 */
import Fragment from '../Fragment';
import CommentFragment from './CommentFragment';
import ReactableFragment from './ReactableFragment';

export class CommitCommentFragment extends Fragment {
  code = 'commitComment';

  get dependencies(): Fragment[] {
    return [ReactableFragment, CommentFragment];
  }

  toString(): string {
    return `
      fragment ${this.code} on CommitComment {
        __typename
        id
        ... on Comment { ...${CommentFragment.code} }
        commit { id:oid }
        databaseId
        path
        position
        ...${ReactableFragment.code}
      }
    `;
  }
}

export default new CommitCommentFragment();

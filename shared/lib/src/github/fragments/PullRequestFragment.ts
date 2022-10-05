import Fragment from '../Fragment';
import { SimplifiedActorFragment } from './ActorFragment';
import { IssueFragment } from './IssueFragment';

export class PullRequestFragment extends IssueFragment {
  code = 'pull';

  constructor(simplified = false) {
    super(simplified);
    this.code = 'sPull';
  }

  get dependencies(): Fragment[] {
    if (this.full) return super.dependencies.concat([SimplifiedActorFragment]);
    return super.dependencies;
  }

  get objectName(): string {
    return 'PullRequest';
  }

  get additionalProperties(): string {
    return `
      additions
      ${Fragment.include(this.full, `baseRef { name target { id:oid } }`)}
      baseRefName
      ${Fragment.include(this.full, 'baseRefOid')}
      ${Fragment.include(this.full, 'baseRepository { id }')}
      ${Fragment.include(this.full, 'canBeRebased')}
      ${Fragment.include(this.full, 'changedFiles')}
      ${Fragment.include(this.full, 'closingIssuesReferences { totalCount }')}
      ${Fragment.include(this.full, 'commits { totalCount }')}
      ${Fragment.include(this.full, 'deletions')}
      ${Fragment.include(this.full, `headRef { name target { id:oid } }`)}
      ${Fragment.include(this.full, 'headRefName')}
      ${Fragment.include(this.full, 'headRefOid')}
      ${Fragment.include(this.full, `headRepositoryOwner { ...${SimplifiedActorFragment.code} }`)}
      ${Fragment.include(this.full, 'headRepository { id }')}
      isCrossRepository
      ${Fragment.include(this.full, 'isDraft')}
      ${Fragment.include(this.full, 'locked')}
      ${Fragment.include(this.full, 'maintainerCanModify')}
      ${Fragment.include(this.full, `mergeCommit { id:oid }`)}
      ${Fragment.include(this.full, 'mergeStateStatus')}
      ${Fragment.include(this.full, 'mergeable')}
      merged
      mergedAt
      ${Fragment.include(this.full, `mergedBy { ...${SimplifiedActorFragment.code} }`)}
      ${Fragment.include(this.full, 'milestone { id }')}
      ${Fragment.include(this.full, 'permalink')}
      ${Fragment.include(this.full, `potentialMergeCommit { id:oid }`)}
      ${Fragment.include(this.full, `reviewDecision`)}
      ${Fragment.include(this.full, `reviewRequests { totalCount }`)}
      ${Fragment.include(this.full, `reviews { totalCount }`)}
      ${Fragment.include(
        this.full,
        `suggestedReviewers { isAuthor isCommenter reviewer { ...${SimplifiedActorFragment.code} } }`,
      )}
    `;
  }
}

export default new PullRequestFragment();
export const SimplifiedPullRequest = new PullRequestFragment(true);

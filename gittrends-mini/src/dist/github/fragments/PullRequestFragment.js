"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedPullRequest = exports.PullRequestFragment = void 0;
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
const IssueFragment_1 = require("./IssueFragment");
class PullRequestFragment extends IssueFragment_1.IssueFragment {
    constructor(simplified = false) {
        super(simplified);
        this.code = "pull";
        this.code = "sPull";
    }
    get dependencies() {
        if (this.full)
            return super.dependencies.concat([
                CommitFragment_1.default,
                ActorFragment_1.SimplifiedActorFragment,
            ]);
        return super.dependencies;
    }
    get objectName() {
        return "PullRequest";
    }
    get additionalProperties() {
        return `
      baseRefName
      isCrossRepository
      merged
      mergedAt
      additions
      ${Fragment_1.default.include(this.full, `baseRef { name target { ...${CommitFragment_1.default.code} } }`)}
      ${Fragment_1.default.include(this.full, "baseRefOid")}
      ${Fragment_1.default.include(this.full, "baseRepository { id }")}
      ${Fragment_1.default.include(this.full, "canBeRebased")}
      ${Fragment_1.default.include(this.full, "changedFiles")}
      ${Fragment_1.default.include(this.full, "deletions")}
      ${Fragment_1.default.include(this.full, `headRef { name target { ...${CommitFragment_1.default.code} } }`)}
      ${Fragment_1.default.include(this.full, "headRefName")}
      ${Fragment_1.default.include(this.full, "headRefOid")}
      ${Fragment_1.default.include(this.full, "headRepository { id }")}
      ${Fragment_1.default.include(this.full, `headRepositoryOwner { ...${ActorFragment_1.SimplifiedActorFragment.code} }`)}
      ${Fragment_1.default.include(this.full, "isDraft")}
      ${Fragment_1.default.include(this.full, "maintainerCanModify")}
      ${Fragment_1.default.include(this.full, `mergeCommit { ...${CommitFragment_1.default.code} }`)}
      ${Fragment_1.default.include(this.full, "mergeStateStatus")}
      ${Fragment_1.default.include(this.full, "mergeable")}
      ${Fragment_1.default.include(this.full, `mergedBy { ...${ActorFragment_1.SimplifiedActorFragment.code} }`)}
      ${Fragment_1.default.include(this.full, "permalink")}
      ${Fragment_1.default.include(this.full, `potentialMergeCommit { ...${CommitFragment_1.default.code} }`)}

    `;
    }
}
exports.PullRequestFragment = PullRequestFragment;
exports.default = new PullRequestFragment();
exports.SimplifiedPullRequest = new PullRequestFragment(true);
//# sourceMappingURL=PullRequestFragment.js.map
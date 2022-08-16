"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
class CommitFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "commit";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
    fragment ${this.code} on Commit {
      type:__typename
      additions
      author { date email name user { ...${ActorFragment_1.SimplifiedActorFragment.code} } }
      authoredByCommitter
      authoredDate
      changedFiles
      comments { totalCount }
      committedDate
      committedViaWeb
      committer { date email name user { ...${ActorFragment_1.SimplifiedActorFragment.code} } }
      deletions
      id
      message
      oid
      pushedDate
      repository { id }
      signature {
        email isValid signer { ...${ActorFragment_1.SimplifiedActorFragment.code} } state wasSignedByGitHub
      }
      status { contexts { context description createdAt } id state }
    }
    `;
    }
}
exports.CommitFragment = CommitFragment;
exports.default = new CommitFragment();
//# sourceMappingURL=CommitFragment.js.map
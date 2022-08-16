"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestCommitCommentThreadFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommitCommentFragment_1 = __importDefault(require("./CommitCommentFragment"));
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
class PullRequestCommitCommentThreadFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestCommitCommentThread";
    }
    get dependencies() {
        return [CommitFragment_1.default, CommitCommentFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestCommitCommentThread {
        comments(first: 100) { nodes { ...${CommitCommentFragment_1.default.code} } }
        commit { ...${CommitFragment_1.default.code} }
        path
        position
      }
    `;
    }
}
exports.PullRequestCommitCommentThreadFragment = PullRequestCommitCommentThreadFragment;
exports.default = new PullRequestCommitCommentThreadFragment();
//# sourceMappingURL=PullRequestCommitCommentThreadFragment.js.map
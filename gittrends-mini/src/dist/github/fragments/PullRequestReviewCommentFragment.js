"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestReviewCommentFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommentFragment_1 = __importDefault(require("./CommentFragment"));
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
const ReactableFragment_1 = __importDefault(require("./ReactableFragment"));
class PullRequestReviewCommentFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestReviewComment";
    }
    get dependencies() {
        return [CommitFragment_1.default, CommentFragment_1.default, ReactableFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestReviewComment {
        id
        type:__typename
        ... on Comment { ...${CommentFragment_1.default.code} }
        commit { ...${CommitFragment_1.default.code} }
        databaseId
        diffHunk
        draftedAt
        isMinimized
        minimizedReason
        originalCommit { ...${CommitFragment_1.default.code} }
        originalPosition
        outdated
        path
        position
        ...${ReactableFragment_1.default.code}
        replyTo { id }
        state
        url
      }
    `;
    }
}
exports.PullRequestReviewCommentFragment = PullRequestReviewCommentFragment;
exports.default = new PullRequestReviewCommentFragment();
//# sourceMappingURL=PullRequestReviewCommentFragment.js.map
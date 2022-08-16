"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestReviewThreadFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const PullRequestReviewCommentFragment_1 = __importDefault(require("./PullRequestReviewCommentFragment"));
class PullRequestReviewThreadFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestReviewThread";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, PullRequestReviewCommentFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestReviewThread {
        diffSide
        isCollapsed
        isOutdated
        isResolved
        line
        originalLine
        originalStartLine
        path
        startDiffSide
        startLine
        resolvedBy { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment_1.default.code} } }
      }
    `;
    }
}
exports.PullRequestReviewThreadFragment = PullRequestReviewThreadFragment;
exports.default = new PullRequestReviewThreadFragment();
//# sourceMappingURL=PullRequestReviewThreadFragment.js.map
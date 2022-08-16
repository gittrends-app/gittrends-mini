"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestReviewFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
const PullRequestReviewCommentFragment_1 = __importDefault(require("./PullRequestReviewCommentFragment"));
const ReactableFragment_1 = __importDefault(require("./ReactableFragment"));
class PullRequestReviewFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestReview";
    }
    get dependencies() {
        return [
            ActorFragment_1.SimplifiedActorFragment,
            CommitFragment_1.default,
            ReactableFragment_1.default,
            PullRequestReviewCommentFragment_1.default,
        ];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestReview {
        type:__typename
        author { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        authorAssociation
        body
        comments(first: 100) { nodes { ...${PullRequestReviewCommentFragment_1.default.code} } }
        commit { ...${CommitFragment_1.default.code} }
        createdAt
        createdViaEmail
        databaseId
        editor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        lastEditedAt
        publishedAt
        ...${ReactableFragment_1.default.code}
        state
        submittedAt
        updatedAt
        url
      }
    `;
    }
}
exports.PullRequestReviewFragment = PullRequestReviewFragment;
exports.default = new PullRequestReviewFragment();
//# sourceMappingURL=PullRequestReviewFragment.js.map
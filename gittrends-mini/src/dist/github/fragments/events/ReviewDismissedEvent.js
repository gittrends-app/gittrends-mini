"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewDismissedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const PullRequestCommitFragment_1 = __importDefault(require("../PullRequestCommitFragment"));
class ReviewDismissedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "reviewDismissedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, PullRequestCommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on ReviewDismissedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        databaseId
        dismissalMessage
        previousReviewState
        pullRequestCommit { ...${PullRequestCommitFragment_1.default.code} }
        review { id }
        url
      }
    `;
    }
}
exports.ReviewDismissedEvent = ReviewDismissedEvent;
exports.default = new ReviewDismissedEvent();
//# sourceMappingURL=ReviewDismissedEvent.js.map
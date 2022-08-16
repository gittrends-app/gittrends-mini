"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestRevisionMarkerFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
class PullRequestRevisionMarkerFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestRevisionMarker";
    }
    get dependencies() {
        return [CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestRevisionMarker {
        createdAt
        lastSeenCommit { ...${CommitFragment_1.default.code} }
      }
    `;
    }
}
exports.PullRequestRevisionMarkerFragment = PullRequestRevisionMarkerFragment;
exports.default = new PullRequestRevisionMarkerFragment();
//# sourceMappingURL=PullRequestRevisionMarkerFragment.js.map
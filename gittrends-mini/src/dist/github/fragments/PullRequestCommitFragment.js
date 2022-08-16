"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestCommitFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
class PullRequestCommitFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pullRequestCommit";
    }
    get dependencies() {
        return [CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on PullRequestCommit {
        commit { ...${CommitFragment_1.default.code} }
      }
    `;
    }
}
exports.PullRequestCommitFragment = PullRequestCommitFragment;
exports.default = new PullRequestCommitFragment();
//# sourceMappingURL=PullRequestCommitFragment.js.map
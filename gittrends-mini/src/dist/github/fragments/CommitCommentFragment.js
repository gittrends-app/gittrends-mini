"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitCommentFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommentFragment_1 = __importDefault(require("./CommentFragment"));
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
const ReactableFragment_1 = __importDefault(require("./ReactableFragment"));
class CommitCommentFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "commitComment";
    }
    get dependencies() {
        return [ReactableFragment_1.default, CommentFragment_1.default, CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on CommitComment {
        type:__typename
        id
        ... on Comment { ...${CommentFragment_1.default.code} }
        commit { ...${CommitFragment_1.default.code} }
        databaseId
        path
        position
        ...${ReactableFragment_1.default.code}
      }
    `;
    }
}
exports.CommitCommentFragment = CommitCommentFragment;
exports.default = new CommitCommentFragment();
//# sourceMappingURL=CommitCommentFragment.js.map
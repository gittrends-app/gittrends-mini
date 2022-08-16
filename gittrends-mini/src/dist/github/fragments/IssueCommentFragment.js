"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueCommentFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const CommentFragment_1 = __importDefault(require("./CommentFragment"));
const ReactableFragment_1 = __importDefault(require("./ReactableFragment"));
class IssueCommentFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "issueComment";
    }
    get dependencies() {
        return [ReactableFragment_1.default, CommentFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on IssueComment {
        ...${CommentFragment_1.default.code}
        lastEditedAt
        publishedAt
        isMinimized
        minimizedReason
        ...${ReactableFragment_1.default.code}
      }
    `;
    }
}
exports.IssueCommentFragment = IssueCommentFragment;
exports.default = new IssueCommentFragment();
//# sourceMappingURL=IssueCommentFragment.js.map
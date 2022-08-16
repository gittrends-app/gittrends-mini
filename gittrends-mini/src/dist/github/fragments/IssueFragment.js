"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedIssueFragment = exports.IssueFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const MilestoneFragment_1 = __importDefault(require("./MilestoneFragment"));
const ReactableFragment_1 = __importDefault(require("./ReactableFragment"));
class IssueFragment extends Fragment_1.default {
    constructor(simplified = false) {
        super();
        this.code = "issue";
        this.full = true;
        this.code = "sIssue";
        this.full = !simplified;
    }
    get dependencies() {
        return [
            ActorFragment_1.SimplifiedActorFragment,
            ...(this.full ? [ReactableFragment_1.default, MilestoneFragment_1.default] : []),
        ];
    }
    get objectName() {
        return "Issue";
    }
    get additionalProperties() {
        return "";
    }
    toString() {
        return `
      fragment ${this.code} on ${this.objectName} {
        type:__typename
        ${Fragment_1.default.include(this.full, "activeLockReason")}
        author { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        authorAssociation
        ${Fragment_1.default.include(this.full, "body")}
        ${Fragment_1.default.include(this.full, "closed")}
        closedAt
        createdAt
        createdViaEmail
        databaseId
        editor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        id
        ${Fragment_1.default.include(this.full, "includesCreatedEdit")}
        lastEditedAt
        locked
        ${Fragment_1.default.include(this.full, `milestone { ...${MilestoneFragment_1.default.code} }`)}
        number
        publishedAt
        ${Fragment_1.default.include(this.full, `...${ReactableFragment_1.default.code}`)}
        state
        title
        updatedAt
        ${this.additionalProperties}
      }
    `;
    }
}
exports.IssueFragment = IssueFragment;
exports.default = new IssueFragment();
exports.SimplifiedIssueFragment = new IssueFragment(true);
//# sourceMappingURL=IssueFragment.js.map
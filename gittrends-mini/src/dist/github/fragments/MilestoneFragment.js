"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestoneFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
class MilestoneFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "milestone";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on Milestone {
        type:__typename
        repository { id }
        creator { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        description
        dueOn
        id
        number
        progressPercentage
        state
        title
      }
    `;
    }
}
exports.MilestoneFragment = MilestoneFragment;
exports.default = new MilestoneFragment();
//# sourceMappingURL=MilestoneFragment.js.map
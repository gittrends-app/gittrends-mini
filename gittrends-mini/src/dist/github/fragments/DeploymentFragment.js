"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
class DeploymentFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "deployment";
    }
    get dependencies() {
        return [CommitFragment_1.default, ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on Deployment {
        commit { ...${CommitFragment_1.default.code} }
        createdAt
        creator { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        databaseId
        environment
        id
        payload
        state
        statuses (last: 100) {
          nodes {
            creator { ...${ActorFragment_1.SimplifiedActorFragment.code} }
            description
            environmentUrl
            id
            logUrl
            state
          }
        }
      }
    `;
    }
}
exports.DeploymentFragment = DeploymentFragment;
exports.default = new DeploymentFragment();
//# sourceMappingURL=DeploymentFragment.js.map
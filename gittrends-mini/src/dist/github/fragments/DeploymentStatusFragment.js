"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentStatusFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const DeploymentFragment_1 = __importDefault(require("./DeploymentFragment"));
class DeploymentStatusFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "deploymentStatus";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, DeploymentFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on DeploymentStatus {
        createdAt
        creator { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        deployment { ...${DeploymentFragment_1.default.code} }
        description
        logUrl
        state
        updatedAt
      }
    `;
    }
}
exports.DeploymentStatusFragment = DeploymentStatusFragment;
exports.default = new DeploymentStatusFragment();
//# sourceMappingURL=DeploymentStatusFragment.js.map
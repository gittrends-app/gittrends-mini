"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentEnvironmentChangedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const DeploymentStatusFragment_1 = __importDefault(require("../DeploymentStatusFragment"));
class DeploymentEnvironmentChangedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "deploymentEnvironmentChangedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, DeploymentStatusFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on DeploymentEnvironmentChangedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        deploymentStatus { ...${DeploymentStatusFragment_1.default.code} }
      }
    `;
    }
}
exports.DeploymentEnvironmentChangedEvent = DeploymentEnvironmentChangedEvent;
exports.default = new DeploymentEnvironmentChangedEvent();
//# sourceMappingURL=DeploymentEnvironmentChangedEvent.js.map
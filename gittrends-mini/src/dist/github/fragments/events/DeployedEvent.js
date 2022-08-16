"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const DeploymentFragment_1 = __importDefault(require("../DeploymentFragment"));
class DeployedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "deployedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, DeploymentFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on DeployedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        databaseId
        deployment { ...${DeploymentFragment_1.default.code} }
        ref { name target { id } }
      }
    `;
    }
}
exports.DeployedEvent = DeployedEvent;
exports.default = new DeployedEvent();
//# sourceMappingURL=DeployedEvent.js.map
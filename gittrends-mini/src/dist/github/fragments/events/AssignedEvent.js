"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AssignedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "assignedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AssignedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        assignee { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.AssignedEvent = AssignedEvent;
exports.default = new AssignedEvent();
//# sourceMappingURL=AssignedEvent.js.map
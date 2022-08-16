"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnassignedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class UnassignedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "unassignedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on UnassignedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        assignee { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.UnassignedEvent = UnassignedEvent;
exports.default = new UnassignedEvent();
//# sourceMappingURL=UnassignedEvent.js.map
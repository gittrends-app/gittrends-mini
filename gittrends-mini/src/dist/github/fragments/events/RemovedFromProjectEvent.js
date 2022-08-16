"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovedFromProjectEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class RemovedFromProjectEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "removedFromProjectEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on RemovedFromProjectEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        project { id }
        projectColumnName
      }
    `;
    }
}
exports.RemovedFromProjectEvent = RemovedFromProjectEvent;
exports.default = new RemovedFromProjectEvent();
//# sourceMappingURL=RemovedFromProjectEvent.js.map
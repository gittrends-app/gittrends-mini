"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRebaseEnabledEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AutoRebaseEnabledEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "autoRebaseEnabledEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AutoRebaseEnabledEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        enabler { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.AutoRebaseEnabledEvent = AutoRebaseEnabledEvent;
exports.default = new AutoRebaseEnabledEvent();
//# sourceMappingURL=AutoRebaseEnabledEvent.js.map
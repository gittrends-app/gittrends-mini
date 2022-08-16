"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoSquashEnabledEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AutoSquashEnabledEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "autoSquashEnabledEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AutoSquashEnabledEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        enabler { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.AutoSquashEnabledEvent = AutoSquashEnabledEvent;
exports.default = new AutoSquashEnabledEvent();
//# sourceMappingURL=AutoSquashEnabledEvent.js.map
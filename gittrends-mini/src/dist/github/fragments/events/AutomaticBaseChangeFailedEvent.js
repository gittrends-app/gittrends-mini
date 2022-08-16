"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticBaseChangeFailedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AutomaticBaseChangeFailedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "automaticBaseChangeFailedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AutomaticBaseChangeFailedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
    }
}
exports.AutomaticBaseChangeFailedEvent = AutomaticBaseChangeFailedEvent;
exports.default = new AutomaticBaseChangeFailedEvent();
//# sourceMappingURL=AutomaticBaseChangeFailedEvent.js.map
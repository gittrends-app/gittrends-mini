"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomaticBaseChangeSucceededEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AutomaticBaseChangeSucceededEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "automaticBaseChangeSucceededEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AutomaticBaseChangeSucceededEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        newBase
        oldBase
      }
    `;
    }
}
exports.AutomaticBaseChangeSucceededEvent = AutomaticBaseChangeSucceededEvent;
exports.default = new AutomaticBaseChangeSucceededEvent();
//# sourceMappingURL=AutomaticBaseChangeSucceededEvent.js.map
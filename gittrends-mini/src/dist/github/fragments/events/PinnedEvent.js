"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinnedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class PinnedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "pinnedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on PinnedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.PinnedEvent = PinnedEvent;
exports.default = new PinnedEvent();
//# sourceMappingURL=PinnedEvent.js.map
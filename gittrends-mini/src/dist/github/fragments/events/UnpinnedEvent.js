"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnpinnedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class UnpinnedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "unpinnedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on UnpinnedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.UnpinnedEvent = UnpinnedEvent;
exports.default = new UnpinnedEvent();
//# sourceMappingURL=UnpinnedEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossReferencedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class CrossReferencedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "crossReferencedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on CrossReferencedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        isCrossRepository
        referencedAt
        source { type:__typename ... on Node { id } }
        target { type:__typename ... on Node { id } }
        url
        willCloseTarget
      }
    `;
    }
}
exports.CrossReferencedEvent = CrossReferencedEvent;
exports.default = new CrossReferencedEvent();
//# sourceMappingURL=CrossReferencedEvent.js.map
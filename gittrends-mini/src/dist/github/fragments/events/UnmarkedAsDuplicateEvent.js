"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnmarkedAsDuplicateEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class UnmarkedAsDuplicateEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "unmarkedAsDuplicateEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on UnmarkedAsDuplicateEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        duplicate { ... on Node { id } }
        canonical { ... on Node { id } }
        isCrossRepository
      }
    `;
    }
}
exports.UnmarkedAsDuplicateEvent = UnmarkedAsDuplicateEvent;
exports.default = new UnmarkedAsDuplicateEvent();
//# sourceMappingURL=UnmarkedAsDuplicateEvent.js.map
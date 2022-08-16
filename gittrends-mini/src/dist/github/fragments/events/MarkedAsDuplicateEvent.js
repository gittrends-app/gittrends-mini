"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkedAsDuplicateEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class MarkedAsDuplicateEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "markedAsDuplicateEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on MarkedAsDuplicateEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        duplicate { ... on Node { id } }
        canonical { ... on Node { id } }
        isCrossRepository
      }
    `;
    }
}
exports.MarkedAsDuplicateEvent = MarkedAsDuplicateEvent;
exports.default = new MarkedAsDuplicateEvent();
//# sourceMappingURL=MarkedAsDuplicateEvent.js.map
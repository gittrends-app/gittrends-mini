"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferencedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const CommitFragment_1 = __importDefault(require("../CommitFragment"));
class ReferencedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "referencedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on ReferencedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        commit { ...${CommitFragment_1.default.code} }
        commitRepository { id }
        createdAt
        isCrossRepository
        isDirectReference
      }
    `;
    }
}
exports.ReferencedEvent = ReferencedEvent;
exports.default = new ReferencedEvent();
//# sourceMappingURL=ReferencedEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClosedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const CommitFragment_1 = __importDefault(require("../CommitFragment"));
class ClosedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "closedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on ClosedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        closer {
          type:__typename
          ... on Node { id }
          ... on Commit { ...${CommitFragment_1.default.code} }
        }
        createdAt
      }
    `;
    }
}
exports.ClosedEvent = ClosedEvent;
exports.default = new ClosedEvent();
//# sourceMappingURL=ClosedEvent.js.map
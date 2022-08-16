"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadRefForcePushedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const CommitFragment_1 = __importDefault(require("../CommitFragment"));
class HeadRefForcePushedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "headRefForcePushedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on HeadRefForcePushedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        afterCommit { ...${CommitFragment_1.default.code} }
        beforeCommit { ...${CommitFragment_1.default.code} }
        createdAt
        ref { name target { id } }
      }
    `;
    }
}
exports.HeadRefForcePushedEvent = HeadRefForcePushedEvent;
exports.default = new HeadRefForcePushedEvent();
//# sourceMappingURL=HeadRefForcePushedEvent.js.map
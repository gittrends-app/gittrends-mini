"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
const CommitFragment_1 = __importDefault(require("../CommitFragment"));
class MergedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "mergedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, CommitFragment_1.default];
    }
    toString() {
        return `
      fragment ${this.code} on MergedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        commit { ...${CommitFragment_1.default.code} }
        createdAt
        mergeRef { name target { id } }
        mergeRefName
        url
      }
    `;
    }
}
exports.MergedEvent = MergedEvent;
exports.default = new MergedEvent();
//# sourceMappingURL=MergedEvent.js.map
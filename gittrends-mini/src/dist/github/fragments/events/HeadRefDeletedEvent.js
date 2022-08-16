"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadRefDeletedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class HeadRefDeletedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "headRefDeletedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on HeadRefDeletedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        headRef { name target { id } }
        headRefName
      }
    `;
    }
}
exports.HeadRefDeletedEvent = HeadRefDeletedEvent;
exports.default = new HeadRefDeletedEvent();
//# sourceMappingURL=HeadRefDeletedEvent.js.map
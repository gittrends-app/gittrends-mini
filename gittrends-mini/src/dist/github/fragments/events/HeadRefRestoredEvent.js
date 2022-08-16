"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeadRefRestoredEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class HeadRefRestoredEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "headRefRestoredEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on HeadRefRestoredEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.HeadRefRestoredEvent = HeadRefRestoredEvent;
exports.default = new HeadRefRestoredEvent();
//# sourceMappingURL=HeadRefRestoredEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferredEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class TransferredEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "transferredEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on TransferredEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        fromRepository { id nameWithOwner }
      }
    `;
    }
}
exports.TransferredEvent = TransferredEvent;
exports.default = new TransferredEvent();
//# sourceMappingURL=TransferredEvent.js.map
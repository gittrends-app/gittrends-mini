"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadyForReviewEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class ReadyForReviewEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "readyForReviewEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on ReadyForReviewEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.ReadyForReviewEvent = ReadyForReviewEvent;
exports.default = new ReadyForReviewEvent();
//# sourceMappingURL=ReadyForReviewEvent.js.map
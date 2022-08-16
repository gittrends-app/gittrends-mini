"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRequestedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class ReviewRequestedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "reviewRequestedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on ReviewRequestedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        requestedReviewer { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.ReviewRequestedEvent = ReviewRequestedEvent;
exports.default = new ReviewRequestedEvent();
//# sourceMappingURL=ReviewRequestedEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRequestRemovedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class ReviewRequestRemovedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "reviewRequestRemovedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on ReviewRequestRemovedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        requestedReviewer { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.ReviewRequestRemovedEvent = ReviewRequestRemovedEvent;
exports.default = new ReviewRequestRemovedEvent();
//# sourceMappingURL=ReviewRequestRemovedEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class SubscribedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "subscribedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on SubscribedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
      }
    `;
    }
}
exports.SubscribedEvent = SubscribedEvent;
exports.default = new SubscribedEvent();
//# sourceMappingURL=SubscribedEvent.js.map
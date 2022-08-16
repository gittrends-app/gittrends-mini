"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBlockedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class UserBlockedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "userBlockedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on UserBlockedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        blockDuration
        createdAt
        subject { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.UserBlockedEvent = UserBlockedEvent;
exports.default = new UserBlockedEvent();
//# sourceMappingURL=UserBlockedEvent.js.map
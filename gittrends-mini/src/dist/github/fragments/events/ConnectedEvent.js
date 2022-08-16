"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class ConnectedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "connectedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on ConnectedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        isCrossRepository
        source {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
        subject {
          ... on Issue { id type:__typename }
          ... on PullRequest { id type:__typename }
        }
      }
    `;
    }
}
exports.ConnectedEvent = ConnectedEvent;
exports.default = new ConnectedEvent();
//# sourceMappingURL=ConnectedEvent.js.map
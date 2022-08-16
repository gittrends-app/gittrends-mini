"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MilestonedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class MilestonedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "milestonedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on MilestonedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
    }
}
exports.MilestonedEvent = MilestonedEvent;
exports.default = new MilestonedEvent();
//# sourceMappingURL=MilestonedEvent.js.map
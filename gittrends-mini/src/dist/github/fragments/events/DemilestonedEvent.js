"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemilestonedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class DemilestonedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "demilestonedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on DemilestonedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        milestoneTitle
      }
    `;
    }
}
exports.DemilestonedEvent = DemilestonedEvent;
exports.default = new DemilestonedEvent();
//# sourceMappingURL=DemilestonedEvent.js.map
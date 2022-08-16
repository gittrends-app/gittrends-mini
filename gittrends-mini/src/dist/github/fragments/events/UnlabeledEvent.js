"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnlabeledEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class UnlabeledEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "unlabeledEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on UnlabeledEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        label { name }
      }
    `;
    }
}
exports.UnlabeledEvent = UnlabeledEvent;
exports.default = new UnlabeledEvent();
//# sourceMappingURL=UnlabeledEvent.js.map
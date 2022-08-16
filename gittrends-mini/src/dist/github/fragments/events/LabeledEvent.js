"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabeledEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class LabeledEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "labeledEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on LabeledEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        label { name }
      }
    `;
    }
}
exports.LabeledEvent = LabeledEvent;
exports.default = new LabeledEvent();
//# sourceMappingURL=LabeledEvent.js.map
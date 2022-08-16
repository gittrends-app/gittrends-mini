"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRefChangedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class BaseRefChangedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "baseRefChangedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on BaseRefChangedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        currentRefName
        previousRefName
      }
    `;
    }
}
exports.BaseRefChangedEvent = BaseRefChangedEvent;
exports.default = new BaseRefChangedEvent();
//# sourceMappingURL=BaseRefChangedEvent.js.map
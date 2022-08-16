"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRefDeletedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class BaseRefDeletedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "baseRefDeletedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on BaseRefDeletedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        baseRefName
        createdAt
      }
    `;
    }
}
exports.BaseRefDeletedEvent = BaseRefDeletedEvent;
exports.default = new BaseRefDeletedEvent();
//# sourceMappingURL=BaseRefDeletedEvent.js.map
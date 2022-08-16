"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMergeDisabledEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AutoMergeDisabledEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "autoMergeDisabledEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AutoMergeDisabledEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        disabler { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        reason
        reasonCode
      }
    `;
    }
}
exports.AutoMergeDisabledEvent = AutoMergeDisabledEvent;
exports.default = new AutoMergeDisabledEvent();
//# sourceMappingURL=AutoMergeDisabledEvent.js.map
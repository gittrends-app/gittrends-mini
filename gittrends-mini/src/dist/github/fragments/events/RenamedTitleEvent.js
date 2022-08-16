"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenamedTitleEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class RenamedTitleEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "renamedTitleEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on RenamedTitleEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        currentTitle
        previousTitle
      }
    `;
    }
}
exports.RenamedTitleEvent = RenamedTitleEvent;
exports.default = new RenamedTitleEvent();
//# sourceMappingURL=RenamedTitleEvent.js.map
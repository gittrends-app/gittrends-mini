"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddedToProjectEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class AddedToProjectEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "addedToProjectEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on AddedToProjectEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
    }
}
exports.AddedToProjectEvent = AddedToProjectEvent;
exports.default = new AddedToProjectEvent();
//# sourceMappingURL=AddedToProjectEvent.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvertedNoteToIssueEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class ConvertedNoteToIssueEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "convertedNoteToIssueEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on ConvertedNoteToIssueEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        project { id }
        projectCard { id }
        projectColumnName
      }
    `;
    }
}
exports.ConvertedNoteToIssueEvent = ConvertedNoteToIssueEvent;
exports.default = new ConvertedNoteToIssueEvent();
//# sourceMappingURL=ConvertedNoteToIssueEvent.js.map
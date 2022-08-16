"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const Component_1 = __importDefault(require("../Component"));
const ActorFragment_1 = __importDefault(require("../fragments/ActorFragment"));
class ActorComponent extends Component_1.default {
    constructor(id) {
        super(id, "actor");
    }
    get fragments() {
        return [ActorFragment_1.default];
    }
    toString() {
        return `
      ${this.alias}:node(id: "${this.id}") {
        ...${ActorFragment_1.default.code}
      }
    `;
    }
}
exports.default = ActorComponent;
//# sourceMappingURL=ActorComponent.js.map
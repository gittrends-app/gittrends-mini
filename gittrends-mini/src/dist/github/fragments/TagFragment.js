"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
const CommitFragment_1 = __importDefault(require("./CommitFragment"));
class TagFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "tag";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment, CommitFragment_1.default];
    }
    toString() {
        return `
    fragment ${this.code} on Tag {
      id
      message
      name
      oid
      tagger { date email name user { ...${ActorFragment_1.SimplifiedActorFragment.code} } }
      target { ...${CommitFragment_1.default.code} }
    }
    `;
    }
}
exports.TagFragment = TagFragment;
exports.default = new TagFragment();
//# sourceMappingURL=TagFragment.js.map
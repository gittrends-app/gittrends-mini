"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
class ReleaseFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "release";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
    fragment ${this.code} on Release {
      author { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      createdAt
      description
      id
      isDraft
      isPrerelease
      name
      publishedAt
      releaseAssets { totalCount }
      tag { id }
      tagName
      updatedAt
    }
    `;
    }
}
exports.ReleaseFragment = ReleaseFragment;
exports.default = new ReleaseFragment();
//# sourceMappingURL=ReleaseFragment.js.map
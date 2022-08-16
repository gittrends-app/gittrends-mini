"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
class CommentFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "comment";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on Comment {
        author { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        authorAssociation
        body
        createdAt
        createdViaEmail
        editor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        id
        includesCreatedEdit
        lastEditedAt
        publishedAt
        updatedAt
      }
    `;
    }
}
exports.CommentFragment = CommentFragment;
exports.default = new CommentFragment();
//# sourceMappingURL=CommentFragment.js.map
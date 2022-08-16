"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentDeletedEvent = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../../Fragment"));
const ActorFragment_1 = require("../ActorFragment");
class CommentDeletedEvent extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "commentDeletedEvent";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
      fragment ${this.code} on CommentDeletedEvent {
        actor { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        createdAt
        deletedCommentAuthor  { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      }
    `;
    }
}
exports.CommentDeletedEvent = CommentDeletedEvent;
exports.default = new CommentDeletedEvent();
//# sourceMappingURL=CommentDeletedEvent.js.map
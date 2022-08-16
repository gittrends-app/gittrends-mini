"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const Component_1 = __importDefault(require("../Component"));
const ActorFragment_1 = require("../fragments/ActorFragment");
class ReactionComponent extends Component_1.default {
    constructor(id, alias = "reactable") {
        super(id, alias);
    }
    get fragments() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    includeReactions(include = true, { first = 100, after }) {
        const args = super.argsToString({ first, after });
        this.includes.reactions = include && {
            textFragment: `
        ... on Reactable {
          reactions(${args}, orderBy: { field: CREATED_AT, direction: ASC }) {
            pageInfo { hasNextPage endCursor }
            nodes { content createdAt id user { ...${ActorFragment_1.SimplifiedActorFragment.code} } }
          }
        }
      `,
            first,
            after,
        };
        return this;
    }
    toString() {
        return this.includes.reactions
            ? `
          ${this.alias}:node(id: "${this.id}") {
            type:__typename
            ${this.includes.reactions.textFragment}
          }
        `
            : "";
    }
}
exports.default = ReactionComponent;
//# sourceMappingURL=ReactionComponent.js.map
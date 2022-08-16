"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
const Component_1 = __importDefault(require("../Component"));
const RepositoryFragment_1 = require("../fragments/RepositoryFragment");
class SearchComponent extends Component_1.default {
    constructor(query, after, first) {
        super(null, "search");
        this.includes.search = {
            textFragment: "",
            first,
            after,
            query: query !== null && query !== void 0 ? query : {},
        };
    }
    get fragments() {
        return [RepositoryFragment_1.SimplifiedRepositoryFragment];
    }
    toString() {
        var _a, _b;
        const searchQuery = (0, lodash_1.get)(this.includes, "search.query", {});
        let query = `stars:${(_a = searchQuery.minStargazers) !== null && _a !== void 0 ? _a : 0}..${(_b = searchQuery.maxStargazers) !== null && _b !== void 0 ? _b : "*"}`;
        if (searchQuery.sort)
            query += ` sort:${searchQuery.sort}${searchQuery.order ? `-${searchQuery.order}` : ""}`;
        query += " sort:stars-desc sort:forks-desc";
        if (searchQuery.language)
            query += ` language:${searchQuery.language}`;
        if (searchQuery.name)
            query += ` repo:${searchQuery.name}`;
        const args = super.argsToString({
            first: (0, lodash_1.get)(this.includes, "search.first", 100),
            after: (0, lodash_1.get)(this.includes, "search.after"),
            query,
        });
        return `
      ${this.alias}:search(${args}, type: REPOSITORY) {
        pageInfo { hasNextPage endCursor }
        nodes { ...${RepositoryFragment_1.SimplifiedRepositoryFragment.code} }
      }
    `;
    }
}
exports.default = SearchComponent;
//# sourceMappingURL=SearchComponent.js.map
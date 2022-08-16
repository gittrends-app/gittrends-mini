"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const Component_1 = __importDefault(require("../Component"));
class DependencyGraphManifestComponent extends Component_1.default {
    constructor(id, alias = "manifest") {
        super(id, alias);
    }
    get fragments() {
        return [];
    }
    includeDetails(include = true) {
        this.includes.details = include && {
            textFragment: `
        ... on DependencyGraphManifest {
          dependenciesCount
          exceedsMaxSize
          filename
          id
          parseable
        }
      `,
        };
        return this;
    }
    includeDependencies(include = true, { after, first = 100 }) {
        this.includes.dependencies = include && {
            textFragment: `
        ... on DependencyGraphManifest {
          dependencies (${super.argsToString({ after, first })}) {
            pageInfo { hasNextPage endCursor }
            nodes {
              hasDependencies
              packageManager
              packageName
              targetRepository:repository { id databaseId nameWithOwner }
              requirements
            }
          }
        }
      `,
            first,
            after,
        };
        return this;
    }
    toString() {
        return `
      ${this.alias}:node(id: "${this.id}") {
        type: __typename
        ${Object.values(this.includes)
            .filter((m) => m)
            .map((m) => m && m.textFragment)
            .join("\n")}
      }
    `;
    }
}
exports.default = DependencyGraphManifestComponent;
//# sourceMappingURL=DependencyGraphManifestComponent.js.map
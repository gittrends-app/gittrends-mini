"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Source: https://github.com/jane/gql-compress
 */
const gql_compress_1 = __importDefault(require("./gql-compress"));
describe("compress", () => {
    it("should compress a regular query", () => {
        const query = (0, gql_compress_1.default)(`
      query {
        repository(owner:"octocat", name:"Hello-World") {
          issues(last:20, states:CLOSED) {
            edges {
              node {
                title
                url
                labels(first:5) {
                  edges {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);
        const expected = 
        // eslint-disable-next-line no-useless-escape
        'query{repository(owner:"octocat",name:"Hello-World"){issues(last:20,states:CLOSED){edges{node{title url labels(first:5){edges{node{name}}}}}}}}';
        expect((0, gql_compress_1.default)(query)).toBe(expected);
    });
    it("should handle empty inputs", () => {
        expect((0, gql_compress_1.default)("")).toBe("");
    });
});
//# sourceMappingURL=gql-compress.spec.js.map
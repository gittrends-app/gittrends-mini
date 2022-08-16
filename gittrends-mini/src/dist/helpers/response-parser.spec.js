"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_parser_1 = __importDefault(require("./response-parser"));
describe("Parse response received from GitHub API", () => {
    it("should detect GitHub Actors", () => {
        let data = { type: "User", id: 1, value: 1 };
        let result = {
            data: data.id,
            actors: [data],
            commits: [],
            milestones: [],
        };
        expect((0, response_parser_1.default)(data)).toStrictEqual(result);
        data = { user: { type: "User", id: 1, value: 1 } };
        result = {
            data: { user: data.user.id },
            actors: [data.user],
            commits: [],
            milestones: [],
        };
        expect((0, response_parser_1.default)(data)).toStrictEqual(result);
        const types = [
            "Actor",
            "User",
            "Organization",
            "Mannequin",
            "Bot",
            "EnterpriseUserAccount",
        ];
        data = types.map((type, index) => ({ type, id: index, value: 1 }));
        result = {
            data: data.map((d) => d.id),
            actors: data,
            commits: [],
            milestones: [],
        };
        expect((0, response_parser_1.default)(data)).toStrictEqual(result);
    });
    it("should spread comments", () => {
        const data = {
            type: "CommitCommentThread",
            comments: { nodes: [{ comment: "a" }] },
        };
        const response = {
            data: { type: "CommitCommentThread", comments: data.comments.nodes },
            actors: [],
            commits: [],
            milestones: [],
        };
        expect((0, response_parser_1.default)(data)).toStrictEqual(response);
    });
});
//# sourceMappingURL=response-parser.spec.js.map
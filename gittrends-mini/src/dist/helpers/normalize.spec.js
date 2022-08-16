"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const normalize_1 = __importDefault(require("./normalize"));
describe("Normalize response received from GitHub API", () => {
    test("it should transform date strings to objects", () => {
        const date = new Date();
        expect((0, lodash_1.isEqual)({ tested_at: date }, (0, normalize_1.default)({ tested_at: date.toISOString() }))).toBe(true);
        expect((0, lodash_1.isEqual)({ tested_on: date }, (0, normalize_1.default)({ tested_on: date.toISOString() }))).toBe(true);
        expect((0, lodash_1.isEqual)({ date: date }, (0, normalize_1.default)({ date: date.toISOString() }))).toBe(true);
        expect((0, lodash_1.isEqual)([{ date: date }], (0, normalize_1.default)([{ date: date.toISOString() }]))).toBe(true);
    });
    test("it should transform object keys to snake case", () => {
        expect((0, normalize_1.default)({ a: 1 })).toStrictEqual({ a: 1 });
        expect((0, normalize_1.default)({ aA: 1 })).toStrictEqual({ a_a: 1 });
        expect((0, normalize_1.default)({ aA: { bB: "cC" } })).toStrictEqual({
            a_a: { b_b: "cC" },
        });
        expect((0, normalize_1.default)({ aA: { bB: [{ cC: 1 }] } })).toStrictEqual({
            a_a: { b_b: [{ c_c: 1 }] },
        });
    });
    test("it should spread single properties", () => {
        expect((0, normalize_1.default)({ totalCount: 1 })).toStrictEqual(1);
        expect((0, normalize_1.default)({ a: { totalCount: 1 } })).toStrictEqual({ a: 1 });
        expect((0, normalize_1.default)({ a: { total_count: 1 } })).toStrictEqual({ a: 1 });
        expect((0, normalize_1.default)({ a: [{ totalCount: 1 }] })).toStrictEqual({ a: [1] });
        expect((0, normalize_1.default)({ a: { id: 1 } })).toStrictEqual({ a: 1 });
        expect((0, normalize_1.default)({ a: { id: 1, name: 2 } })).toStrictEqual({
            a: { id: 1, name: 2 },
        });
        expect((0, normalize_1.default)({ a: { name: 1 } })).toStrictEqual({ a: 1 });
        expect((0, normalize_1.default)({ a: { target: 1 } })).toStrictEqual({ a: 1 });
    });
    test("it should normalize reaction_groups data", () => {
        expect((0, normalize_1.default)({
            reaction_groups: [
                { content: "HEART", users: 10 },
                { content: "THUMBS_UP", users: 5 },
            ],
        })).toStrictEqual({
            reaction_groups: { heart: 10, thumbs_up: 5 },
        });
    });
});
//# sourceMappingURL=normalize.spec.js.map
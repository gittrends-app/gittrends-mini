"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compact_1 = __importDefault(require("./compact"));
describe("Compact objects by removing nullable values", () => {
    it("should compact array objects", () => {
        expect((0, compact_1.default)([])).toHaveLength(0);
        expect((0, compact_1.default)([{}])).toHaveLength(0);
        expect((0, compact_1.default)([{ a: null }])).toHaveLength(0);
        expect((0, compact_1.default)([{ a: [null, undefined, "", {}, []] }])).toHaveLength(0);
        expect((0, compact_1.default)([null, undefined, "", {}, []])).toHaveLength(0);
        expect((0, compact_1.default)(["valid", { value: true }, { notThisOne: null }])).toHaveLength(2);
    });
    it("should compact plain objects", () => {
        expect((0, compact_1.default)({})).toStrictEqual({});
        expect((0, compact_1.default)({ empty: {} })).toStrictEqual({});
        expect((0, compact_1.default)({ empty: [] })).toStrictEqual({});
        expect((0, compact_1.default)({ empty: undefined })).toStrictEqual({});
        expect((0, compact_1.default)({ empty: [null, undefined, "", {}, []] })).toStrictEqual({});
        expect((0, compact_1.default)(["valid", { value: true }])).toHaveLength(2);
        expect((0, compact_1.default)({ valid: { property: true }, notThisOne: null })).toStrictEqual({
            valid: { property: true },
        });
    });
    it("should not change other values", () => {
        expect((0, compact_1.default)(1)).toBe(1);
        expect((0, compact_1.default)(null)).toBe(null);
        const date = new Date();
        expect((0, compact_1.default)(date)).toBe(date);
        expect((0, compact_1.default)(date.toISOString())).toBe(date.toISOString());
    });
});
//# sourceMappingURL=compact.spec.js.map
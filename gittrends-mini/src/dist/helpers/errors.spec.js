"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const nock_1 = __importDefault(require("nock"));
const errors_1 = require("./errors");
const url = "http://localhost";
afterEach(() => {
    nock_1.default.cleanAll();
});
describe("Test request errors", () => {
    test("it should store information of the failed request", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, nock_1.default)(url).get("/").reply(500, "failed");
        yield expect(axios_1.default.get(url).catch(({ response: { data, status } }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const error = new errors_1.RequestError(new Error(), { data, status: status });
            expect((_a = error.response) === null || _a === void 0 ? void 0 : _a.status).toBe(500);
            expect((_b = error.response) === null || _b === void 0 ? void 0 : _b.data).toBe("failed");
        }))).resolves.toBeUndefined();
    }));
    test("it should create the appropriated error (network issues)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, nock_1.default)(url).get("/").reply(500);
        let error = yield axios_1.default
            .get(url)
            .catch(({ response }) => errors_1.RequestError.create(new Error(), { status: response.status }));
        expect(error).toBeInstanceOf(errors_1.ServerRequestError);
        expect(error.type).toBe("INTERNAL_SERVER");
        (0, nock_1.default)(url).get("/").reply(502);
        error = yield axios_1.default
            .get(url)
            .catch(({ response }) => errors_1.RequestError.create(new Error(), { status: response.status }));
        expect(error).toBeInstanceOf(errors_1.ServerRequestError);
        expect(error.type).toBe("BAD_GATEWAY");
    }));
    test("it should create the appropriated error (github issues)", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, nock_1.default)(url)
            .get("/errors")
            .reply(200, {
            errors: [
                { type: "FORBIDDEN", message: "testing" },
                { type: "INTERNAL", message: "testing" },
                { type: "NOT_FOUND", message: "testing" },
                { type: "MAX_NODE_LIMIT_EXCEEDED", message: "testing" },
                { type: "SERVICE_UNAVAILABLE", message: "testing" },
                { type: "test", message: "timedout" },
                { type: "test", message: "loading" },
                { type: "test", message: "Something went wrong ..." },
            ],
        });
        let response = yield axios_1.default.get(`${url}/errors`);
        let error = errors_1.RequestError.create(new Error(), {
            data: response.data,
            status: response.status,
        });
        expect(error).toBeInstanceOf(errors_1.GithubRequestError);
        expect(error.type).toStrictEqual([
            "FORBIDDEN",
            "INTERNAL",
            "NOT_FOUND",
            "MAX_NODE_LIMIT_EXCEEDED",
            "SERVICE_UNAVAILABLE",
            "TIMEDOUT",
            "LOADING",
            "SOMETHING_WENT_WRONG",
        ]);
        expect(error.all("FORBIDDEN")).toBe(false);
        expect(error.some("FORBIDDEN")).toBe(true);
        (0, nock_1.default)(url)
            .get("/errors")
            .reply(200, {
            errors: [
                { type: "FORBIDDEN", message: "testing" },
                { type: "FORBIDDEN", message: "testing" },
            ],
        });
        response = yield axios_1.default.get(`${url}/errors`);
        error = errors_1.RequestError.create(new Error(), {
            data: response.data,
            status: response.status,
        });
        expect(error.all("FORBIDDEN")).toBe(true);
    }));
});
//# sourceMappingURL=errors.spec.js.map
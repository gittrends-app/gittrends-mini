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
/*
 *  Author: Hudson S. Borges
 */
const nock_1 = __importDefault(require("nock"));
const HttpClient_1 = __importDefault(require("./HttpClient"));
let scope;
const client = new HttpClient_1.default({
    protocol: "http",
    host: "localhost",
    timeout: 1000,
    retries: 2,
});
beforeEach(() => {
    scope = (0, nock_1.default)(client.baseUrl, { allowUnmocked: false }).persist();
});
afterEach(() => {
    nock_1.default.cleanAll();
    nock_1.default.abortPendingRequests();
});
test("it should correctly respond to success queries (2xx)", () => __awaiter(void 0, void 0, void 0, function* () {
    scope.post("/graphql").reply(200);
    yield expect(client.request("")).resolves.toBeDefined();
}));
test("it should correctly respond to client error queries (4xx)", () => __awaiter(void 0, void 0, void 0, function* () {
    scope.post("/graphql").reply(400);
    yield expect(client.request("")).rejects.toThrowError();
}));
test("it should correctly respond to github server error (5xx)", () => __awaiter(void 0, void 0, void 0, function* () {
    scope.post("/graphql").reply(500);
    yield expect(client.request("")).rejects.toThrowError();
}));
test("it should correctly respond to proxy server error (6xx)", () => __awaiter(void 0, void 0, void 0, function* () {
    scope.post("/graphql").reply(600);
    yield expect(client.request("")).rejects.toThrowError();
}));
test("it should retry the request when it fails with 6xx or no status", () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    scope.post("/graphql").reply(() => (count += 1) && [600]);
    yield expect(client.request("")).rejects.toThrowError();
    expect(count).toEqual(client.retries + 1);
}));
test("it shouldn't retry the request when it fails with 4xx", () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    scope.post("/graphql").reply(() => (count += 1) && [400]);
    yield expect(client.request("")).rejects.toThrowError();
    expect(count).toEqual(1);
}));
test("it shouldn't retry the request when it fails with 5xx", () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    scope.post("/graphql").reply(() => (count += 1) && [500]);
    yield expect(client.request("")).rejects.toThrowError();
    expect(count).toEqual(1);
}));
test("it should abort long time running requests", () => __awaiter(void 0, void 0, void 0, function* () {
    let count = 0;
    scope
        .post("/graphql")
        .delay(client.timeout + 1)
        .reply(() => (count += 1) && [200]);
    yield expect(client.request("")).rejects.toThrowError();
    expect(count).toEqual(client.retries + 1);
}));
//# sourceMappingURL=HttpClient.spec.js.map
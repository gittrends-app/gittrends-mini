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
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
class HttpClient {
    constructor(opts) {
        this.timeout = opts.timeout || 15000;
        this.retries = opts.retries || 0;
        this.baseUrl = new URL(`${opts.protocol}://${opts.host}:${opts.port || ""}`).toString();
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                "user-agent": opts.userAgent || "[GitTrends.app] My awesome app",
                Authorization: "bearer " + opts.authToken || ""
            },
            timeout: this.timeout,
            validateStatus: (status) => Math.floor(status / 100) === 2,
        });
        (0, axios_retry_1.default)(this.client, {
            retries: this.retries,
            retryCondition: ({ response }) => !/^[3-5]\d{2}$/.test(`${response === null || response === void 0 ? void 0 : response.status}` || ""),
            retryDelay: axios_retry_1.default.exponentialDelay,
            shouldResetTimeout: true,
        });
    }
    request(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client
                .post("/graphql", data)
                .then(({ status, statusText, data, headers }) => ({
                status,
                statusText,
                data,
                headers,
            }))
                .catch((error) => {
                const { status, statusText, data, headers } = error.response || {};
                return Promise.reject(Object.assign(new Error(), { status, statusText, data, headers }));
            });
        });
    }
}
exports.default = HttpClient;
//# sourceMappingURL=HttpClient.js.map
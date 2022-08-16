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
const lodash_1 = require("lodash");
const errors_1 = require("../helpers/errors");
const gql_compress_1 = __importDefault(require("../helpers/gql-compress"));
const normalize_1 = __importDefault(require("../helpers/normalize"));
class Query {
    constructor(httpClient) {
        this.components = [];
        this.fragments = [];
        this.client = httpClient;
    }
    static create(httpClient) {
        return new Query(httpClient);
    }
    compose(...components) {
        this.components.push(...components);
        let candidates = (0, lodash_1.uniq)(components.reduce((memo, c) => memo.concat(c.fragments), []));
        do {
            candidates = candidates.filter((fragment) => this.fragments.indexOf(fragment) < 0);
            this.fragments.push(...candidates);
            candidates = (0, lodash_1.uniq)(candidates.reduce((memo, c) => memo
                .concat(c.dependencies)
                .filter((fragment) => this.fragments.indexOf(fragment) < 0), []));
        } while (candidates.length > 0);
        return this;
    }
    toString() {
        return `
      query {
        ${this.components.map((component) => component.toString()).join("\n")}
      }
      ${this.fragments.map((fragment) => fragment.toString()).join("\n")}
    `;
    }
    run(interceptor) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.client
                .request({
                query: (0, gql_compress_1.default)(interceptor ? interceptor(this.toString()) : this.toString()),
            })
                .catch((err) => Promise.reject(errors_1.RequestError.create(err, { components: this.components })))
                .then((response) => {
                var _a;
                const data = (0, normalize_1.default)(response.data, true);
                if ((_a = data === null || data === void 0 ? void 0 : data.errors) === null || _a === void 0 ? void 0 : _a.length) {
                    throw errors_1.RequestError.create(new Error(`Response errors (${data.errors.length}): ${JSON.stringify(data.errors)}`), { components: this.components, status: response.status, data });
                }
                return (0, lodash_1.get)(data, "data", {});
            });
        });
    }
}
exports.default = Query;
//# sourceMappingURL=Query.js.map
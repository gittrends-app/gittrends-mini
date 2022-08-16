"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubRequestError = exports.ServerRequestError = exports.RequestError = exports.RepositoryCrawlerError = void 0;
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = new Error(message).stack;
        }
    }
}
class ExtendedError extends BaseError {
    constructor(error) {
        var _a;
        super(error.message);
        this.stack += `\nFrom previous: ${(_a = error.stack) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, "\n    ")}`;
    }
}
class RepositoryCrawlerError extends BaseError {
    constructor(errors) {
        const errorsArray = Array.isArray(errors) ? errors : [errors];
        const messageFragment = errorsArray
            .map((error) => `[${error.constructor.name}]: ${(0, lodash_1.truncate)(error.message, {
            length: 100,
        })}`)
            .join(" & ");
        super(`Errors occurred when updating (see "errors" field) @ ${messageFragment}`);
        this.errors = errorsArray;
    }
}
exports.RepositoryCrawlerError = RepositoryCrawlerError;
class RequestError extends ExtendedError {
    constructor(error, opts) {
        var _a, _b;
        super(error);
        this.response = {
            message: error.message,
            status: (_a = opts === null || opts === void 0 ? void 0 : opts.status) !== null && _a !== void 0 ? _a : error.status,
            data: (_b = opts === null || opts === void 0 ? void 0 : opts.data) !== null && _b !== void 0 ? _b : error.data,
        };
        if (opts === null || opts === void 0 ? void 0 : opts.components) {
            const componentArray = Array.isArray(opts === null || opts === void 0 ? void 0 : opts.components)
                ? opts === null || opts === void 0 ? void 0 : opts.components
                : [opts === null || opts === void 0 ? void 0 : opts.components];
            this.components = componentArray.map((component) => component.toJSON());
        }
    }
    static create(error, opts) {
        const status = error.status || (opts === null || opts === void 0 ? void 0 : opts.status);
        if (status) {
            if (/[24]\d{2}/.test(status.toString()))
                return new GithubRequestError(error, opts);
            else
                return new ServerRequestError(error, opts);
        }
        else {
            return new RequestError(error, opts);
        }
    }
}
exports.RequestError = RequestError;
class ServerRequestError extends RequestError {
    constructor(error, opts) {
        var _a, _b;
        super(error, opts);
        if (((_a = this.response) === null || _a === void 0 ? void 0 : _a.status) === 500)
            this.type = "INTERNAL_SERVER";
        else if (((_b = this.response) === null || _b === void 0 ? void 0 : _b.status) === 502)
            this.type = "BAD_GATEWAY";
        else
            this.type = "UNKNOWN";
    }
}
exports.ServerRequestError = ServerRequestError;
class GithubRequestError extends RequestError {
    constructor(error, opts) {
        var _a, _b;
        super(error, opts);
        this.type = [];
        if ((_b = (_a = this.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errors) {
            this.type = this.response.data.errors.map((value) => {
                if (value.type === "FORBIDDEN")
                    return "FORBIDDEN";
                else if (value.type === "INTERNAL")
                    return "INTERNAL";
                else if (value.type === "NOT_FOUND")
                    return "NOT_FOUND";
                else if (value.type === "MAX_NODE_LIMIT_EXCEEDED")
                    return "MAX_NODE_LIMIT_EXCEEDED";
                else if (value.type === "SERVICE_UNAVAILABLE")
                    return "SERVICE_UNAVAILABLE";
                else if (value.message === "timedout")
                    return "TIMEDOUT";
                else if (value.message === "loading")
                    return "LOADING";
                else if (/^something.went.wrong.*/i.test(value.message))
                    return "SOMETHING_WENT_WRONG";
                return "UNKNOWN";
            });
        }
    }
    is(type) {
        return this.type.length === 1 && this.type[0] === type;
    }
    all(type) {
        const uniqTypes = (0, lodash_1.compact)((0, lodash_1.uniq)(this.type));
        return uniqTypes.length === 1 && uniqTypes[0] === type;
    }
    some(type) {
        var _a;
        return !(0, lodash_1.isNil)((_a = this.type) === null || _a === void 0 ? void 0 : _a.find((t) => t === type));
    }
}
exports.GithubRequestError = GithubRequestError;
//# sourceMappingURL=errors.js.map
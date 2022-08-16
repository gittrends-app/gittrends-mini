import Component from "../github/Component";
declare class BaseError extends Error {
    constructor(message: string);
}
declare class ExtendedError extends BaseError {
    constructor(error: Error);
}
export declare class RepositoryCrawlerError extends BaseError {
    readonly errors: Error[];
    constructor(errors: Error | Error[]);
}
export declare type RequestErrorOptions = {
    components?: Component | Component[];
    status?: number;
    data?: any;
};
export declare class RequestError extends ExtendedError {
    readonly response?: {
        message: string;
        status?: number;
        data?: any;
    };
    readonly components?: any[];
    static create(error: Error, opts?: RequestErrorOptions): RequestError;
    constructor(error: Error, opts?: RequestErrorOptions);
}
export declare class ServerRequestError extends RequestError {
    readonly type: "BAD_GATEWAY" | "INTERNAL_SERVER" | "UNKNOWN";
    constructor(error: Error, opts?: RequestErrorOptions);
}
declare type GithubRequestErrorType = "BLOQUED" | "FORBIDDEN" | "INTERNAL" | "MAX_NODE_LIMIT_EXCEEDED" | "NOT_FOUND" | "NOT_MODIFIED" | "SERVICE_UNAVAILABLE" | "TIMEDOUT" | "LOADING" | "SOMETHING_WENT_WRONG" | "UNKNOWN";
export declare class GithubRequestError extends RequestError {
    readonly type: GithubRequestErrorType[];
    constructor(error: Error, opts?: RequestErrorOptions);
    is(type: GithubRequestErrorType): boolean;
    all(type: GithubRequestErrorType): boolean;
    some(type: GithubRequestErrorType): boolean;
}
export {};
//# sourceMappingURL=errors.d.ts.map
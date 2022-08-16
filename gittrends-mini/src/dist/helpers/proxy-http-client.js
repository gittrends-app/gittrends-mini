"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const HttpClient_1 = __importDefault(require("../github/HttpClient"));
const proxyUrl = new URL(process.env.GT_PROXY_URL || "http://localhost:3000");
exports.default = new HttpClient_1.default({
    protocol: proxyUrl.protocol.replace(/(.*):$/g, "$1"),
    host: proxyUrl.hostname,
    port: proxyUrl.port ? parseInt(proxyUrl.port, 10) : undefined,
    timeout: process.env.GT_PROXY_TIMEOUT
        ? parseInt(process.env.GT_PROXY_TIMEOUT, 10)
        : undefined,
    retries: process.env.GT_PROXY_RETRIES
        ? parseInt(process.env.GT_PROXY_RETRIES, 5)
        : undefined,
    userAgent: process.env.GT_PROXY_USER_AGENT || undefined,
});
//# sourceMappingURL=proxy-http-client.js.map
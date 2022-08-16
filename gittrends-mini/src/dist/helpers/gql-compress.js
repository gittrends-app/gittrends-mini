"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Inspired by: https://github.com/jane/gql-compress
 */
exports.default = (s = "") => s
    .trim()
    .replace(/(\b|\B)[\s\t\r\n]+(\b|\B)/gm, " ")
    .replace(/([{}[\](),:])\s+|\s+([{}[\](),:])/gm, "$1$2");
//# sourceMappingURL=gql-compress.js.map
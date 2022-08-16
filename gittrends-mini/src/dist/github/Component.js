"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
class Component {
    constructor(id, alias) {
        this.id = id;
        this.alias = alias;
        this.includes = {};
    }
    argsToString(args) {
        return Object.entries(args)
            .filter(([, value]) => (0, lodash_1.negate)(lodash_1.isNil)(value))
            .map(([key, value]) => {
            if (typeof value === "number")
                return `${key}: ${value}`;
            if (typeof value === "string")
                return `${key}: "${value}"`;
            throw new Error(`Unknown key/value type (${key}:${args[key]})!`);
        })
            .join(", ");
    }
    toJSON() {
        return Object.assign({ component: this.constructor.name, id: this.id }, (0, lodash_1.omitBy)((0, lodash_1.mapValues)(this.includes, (value) => {
            if (!value)
                return null;
            const nValue = (0, lodash_1.omit)(value, ["textFragment"]);
            return (0, lodash_1.isEmpty)(nValue) ? true : nValue;
        }), lodash_1.isNil));
    }
    setAlias(alias) {
        this.alias = alias;
        return this;
    }
}
exports.default = Component;
//# sourceMappingURL=Component.js.map
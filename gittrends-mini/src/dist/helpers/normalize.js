"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
const compact_1 = require("./compact");
const notNil = (0, lodash_1.negate)(lodash_1.isNil);
const camelToSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/i;
function normalize(object, compact = false) {
    if ((0, lodash_1.isArray)(object)) {
        return object
            .map((value) => normalize(value, compact))
            .filter((value) => (compact ? (0, compact_1.cannotBeRemoved)(value) : true));
    }
    if ((0, lodash_1.isPlainObject)(object)) {
        const _object = (0, lodash_1.reduce)(object, (memo, value, key) => {
            const normalizedValue = normalize(value, compact);
            return Object.assign(memo, (0, compact_1.cannotBeRemoved)(normalizedValue)
                ? { [camelToSnakeCase(key)]: normalizedValue }
                : {});
        }, {});
        if ((0, lodash_1.size)(_object) === 1) {
            if (notNil(_object.id))
                return _object.id;
            if (notNil(_object.name))
                return _object.name;
            if (notNil(_object.target))
                return _object.target;
            if (notNil(_object.total_count))
                return _object.total_count;
        }
        return (0, lodash_1.mapValues)(_object, (value, key) => {
            if (key === "reaction_groups" && value) {
                return value.reduce((memo, v) => v.users === 0
                    ? memo
                    : Object.assign(Object.assign({}, memo), { [v.content.toLowerCase()]: v.users }), {});
            }
            if (/((_|^)date|_(at|on))$/gi.test(key) &&
                typeof value === "string" &&
                DATE_REGEX.test(value)) {
                return new Date(value);
            }
            return value;
        });
    }
    return object;
}
exports.default = normalize;
//# sourceMappingURL=normalize.js.map
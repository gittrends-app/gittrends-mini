"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cannotBeRemoved = exports.canBeRemoved = void 0;
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
function canBeRemoved(value) {
    if ((0, lodash_1.isNil)(value))
        return true;
    else if (value === false || value === 0 || value === "")
        return true;
    else if (((0, lodash_1.isArray)(value) || (0, lodash_1.isPlainObject)(value)) && (0, lodash_1.size)(value) === 0)
        return true;
    return false;
}
exports.canBeRemoved = canBeRemoved;
exports.cannotBeRemoved = (0, lodash_1.negate)(canBeRemoved);
function compact(object, depth = Number.MAX_SAFE_INTEGER) {
    if (depth < 0) {
        return object;
    }
    else if ((0, lodash_1.isArray)(object)) {
        return object
            .map((value) => compact(value, depth - 1))
            .filter(exports.cannotBeRemoved);
    }
    else if ((0, lodash_1.isPlainObject)(object)) {
        return (0, lodash_1.pickBy)((0, lodash_1.mapValues)(object, (value) => compact(value, depth - 1)), exports.cannotBeRemoved);
    }
    return object;
}
exports.default = compact;
//# sourceMappingURL=compact.js.map
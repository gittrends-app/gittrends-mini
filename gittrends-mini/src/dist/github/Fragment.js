"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
class Fragment {
    static include(full, field) {
        return full ? field : "";
    }
    get dependencies() {
        return [];
    }
}
exports.default = Fragment;
//# sourceMappingURL=Fragment.js.map
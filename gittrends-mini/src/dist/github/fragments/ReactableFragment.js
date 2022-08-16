"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactableFragment = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
class ReactableFragment extends Fragment_1.default {
    constructor() {
        super(...arguments);
        this.code = "reactable";
    }
    toString() {
        return `
      fragment ${this.code} on Reactable {
        reactionGroups {
          content
          createdAt
          users { totalCount }
        }
      }
    `;
    }
}
exports.ReactableFragment = ReactableFragment;
exports.default = new ReactableFragment();
//# sourceMappingURL=ReactableFragment.js.map
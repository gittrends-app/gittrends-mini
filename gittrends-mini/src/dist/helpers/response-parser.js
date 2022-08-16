"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const lodash_1 = require("lodash");
const lodash_2 = require("lodash");
function default_1(source) {
    const actors = [];
    const commits = [];
    const milestones = [];
    function recursive(object) {
        if ((0, lodash_2.isArray)(object))
            return object.map(recursive);
        if ((0, lodash_2.isPlainObject)(object)) {
            const _object = (0, lodash_1.mapValues)(object, recursive);
            switch (_object.type) {
                case "Actor":
                case "User":
                case "Organization":
                case "Mannequin":
                case "Bot":
                case "EnterpriseUserAccount":
                    actors.push(_object);
                    return _object.id;
                case "Commit":
                    commits.push((0, lodash_1.omit)(_object, "type"));
                    return _object.id;
                case "Milestone":
                    milestones.push((0, lodash_1.omit)(_object, "type"));
                    return _object.id;
                case "CommitCommentThread":
                case "PullRequestReview":
                case "PullRequestReviewThread":
                    _object.comments = (0, lodash_1.get)(_object, "comments.nodes", []);
                    break;
            }
            return _object;
        }
        return object;
    }
    return {
        data: recursive(source),
        actors: (0, lodash_2.uniqBy)(actors, "id"),
        commits: (0, lodash_2.uniqBy)(commits, "id"),
        milestones: (0, lodash_2.uniqBy)(milestones, "id"),
    };
}
exports.default = default_1;
//# sourceMappingURL=response-parser.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedActorFragment = exports.Actor = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
class Actor extends Fragment_1.default {
    constructor(simplified = false) {
        super();
        this.code = "actor";
        this.full = true;
        if (simplified) {
            this.code = "sActor";
            this.full = !simplified;
        }
    }
    toString() {
        return `
    fragment ${this.code} on Actor {
      avatarUrl login type:__typename
      ... on Node { id }
      ... on User {
        ${Fragment_1.default.include(this.full, "bio")}
        ${Fragment_1.default.include(this.full, "company")}
        createdAt
        databaseId
        email
        ${Fragment_1.default.include(this.full, "followers { totalCount }")}
        ${Fragment_1.default.include(this.full, "following { totalCount }")}
        ${Fragment_1.default.include(this.full, "gists { totalCount }")}
        ${Fragment_1.default.include(this.full, "isBountyHunter")}
        ${Fragment_1.default.include(this.full, "isCampusExpert")}
        ${Fragment_1.default.include(this.full, "isDeveloperProgramMember")}
        ${Fragment_1.default.include(this.full, "isEmployee")}
        ${Fragment_1.default.include(this.full, "isHireable")}
        ${Fragment_1.default.include(this.full, "isSiteAdmin")}
        location
        name
        ${Fragment_1.default.include(this.full, "projects { totalCount }")}
        ${Fragment_1.default.include(this.full, "projectsUrl")}
        ${Fragment_1.default.include(this.full, "repositories { totalCount }")}
        ${Fragment_1.default.include(this.full, "repositoriesContributedTo { totalCount }")}
        ${Fragment_1.default.include(this.full, "starredRepositories { totalCount }")}
        ${Fragment_1.default.include(this.full, "status { id createdAt emoji expiresAt indicatesLimitedAvailability message updatedAt }")}
        twitterUsername
        updatedAt
        ${Fragment_1.default.include(this.full, "watching { totalCount }")}
        websiteUrl
      }
      ... on Organization {
        createdAt
        databaseId
        ${Fragment_1.default.include(this.full, "description")}
        email
        ${Fragment_1.default.include(this.full, "isVerified")}
        location
        ${Fragment_1.default.include(this.full, "membersWithRole { totalCount }")}
        name
        ${Fragment_1.default.include(this.full, "repositories(privacy: PUBLIC) { totalCount }")}
        ${Fragment_1.default.include(this.full, "teams { totalCount }")}
        twitterUsername
        updatedAt
        websiteUrl
      }
      ... on Mannequin {
        createdAt
        databaseId
        email
        updatedAt
      }
      ... on Bot {
        createdAt
        databaseId
        updatedAt
      }
      ... on EnterpriseUserAccount {
        createdAt
        name
        updatedAt
        user { id }
      }
    }
    `;
    }
}
exports.Actor = Actor;
exports.default = new Actor(false);
exports.SimplifiedActorFragment = new Actor(true);
//# sourceMappingURL=ActorFragment.js.map
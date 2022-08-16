"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplifiedRepositoryFragment = exports.Repository = void 0;
/*
 *  Author: Hudson S. Borges
 */
const Fragment_1 = __importDefault(require("../Fragment"));
const ActorFragment_1 = require("./ActorFragment");
class Repository extends Fragment_1.default {
    constructor(simplified = false) {
        super();
        this.code = "repo";
        this.full = true;
        if ((this.full = !simplified))
            this.code = "sRepo";
    }
    get dependencies() {
        return [ActorFragment_1.SimplifiedActorFragment];
    }
    toString() {
        return `
    fragment ${this.code} on Repository {
      ${Fragment_1.default.include(this.full, "assignableUsers { totalCount }")}
      ${Fragment_1.default.include(this.full, "codeOfConduct { name }")}
      createdAt
      databaseId
      defaultBranch:defaultBranchRef { name }
      ${Fragment_1.default.include(this.full, "deleteBranchOnMerge")}
      description
      ${Fragment_1.default.include(this.full, "diskUsage")}
      forks:forkCount
      ${Fragment_1.default.include(this.full, "fundingLinks { platform url }")}
      ${Fragment_1.default.include(this.full, "hasIssuesEnabled")}
      ${Fragment_1.default.include(this.full, "hasProjectsEnabled")}
      ${Fragment_1.default.include(this.full, "hasWikiEnabled")}
      ${Fragment_1.default.include(this.full, "homepageUrl")}
      id
      ${Fragment_1.default.include(this.full, "isArchived")}
      ${Fragment_1.default.include(this.full, "isBlankIssuesEnabled")}
      ${Fragment_1.default.include(this.full, "isDisabled")}
      ${Fragment_1.default.include(this.full, "isEmpty")}
      ${Fragment_1.default.include(this.full, "isFork")}
      ${Fragment_1.default.include(this.full, "isInOrganization")}
      ${Fragment_1.default.include(this.full, "isLocked")}
      ${Fragment_1.default.include(this.full, "isMirror")}
      ${Fragment_1.default.include(this.full, "isPrivate")}
      ${Fragment_1.default.include(this.full, "isSecurityPolicyEnabled")}
      ${Fragment_1.default.include(this.full, "isTemplate")}
      ${Fragment_1.default.include(this.full, "isUserConfigurationRepository")}
      ${Fragment_1.default.include(this.full, "issues { totalCount }")}
      ${Fragment_1.default.include(this.full, "labels { totalCount }")}
      ${Fragment_1.default.include(this.full, "licenseInfo { name }")}
      ${Fragment_1.default.include(this.full, "lockReason")}
      ${Fragment_1.default.include(this.full, "mentionableUsers { totalCount }")}
      ${Fragment_1.default.include(this.full, "mergeCommitAllowed")}
      ${Fragment_1.default.include(this.full, "milestones { totalCount }")}
      ${Fragment_1.default.include(this.full, "mirrorUrl")}
      name
      nameWithOwner
      ${Fragment_1.default.include(this.full, "openGraphImageUrl")}
      owner { ...${ActorFragment_1.SimplifiedActorFragment.code} }
      ${Fragment_1.default.include(this.full, "parent { id }")}
      primaryLanguage { name }
      pushedAt
      ${Fragment_1.default.include(this.full, "pullRequests { totalCount }")}
      ${Fragment_1.default.include(this.full, "rebaseMergeAllowed")}
      ${Fragment_1.default.include(this.full, "releases { totalCount }")}
      ${Fragment_1.default.include(this.full, "squashMergeAllowed")}
      stargazers:stargazerCount
      ${Fragment_1.default.include(this.full, "templateRepository { id }")}
      updatedAt
      ${Fragment_1.default.include(this.full, "url")}
      ${Fragment_1.default.include(this.full, "usesCustomOpenGraphImage")}
      ${Fragment_1.default.include(this.full, "vulnerabilityAlerts { totalCount }")}
      ${Fragment_1.default.include(this.full, "watchers { totalCount }")}
    }
    `;
    }
}
exports.Repository = Repository;
exports.default = new Repository();
exports.SimplifiedRepositoryFragment = new Repository(true);
//# sourceMappingURL=RepositoryFragment.js.map
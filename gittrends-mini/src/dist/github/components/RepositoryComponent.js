"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *  Author: Hudson S. Borges
 */
const Component_1 = __importDefault(require("../Component"));
const ActorFragment_1 = require("../fragments/ActorFragment");
const CommitFragment_1 = __importDefault(require("../fragments/CommitFragment"));
const IssueFragment_1 = require("../fragments/IssueFragment");
const PullRequestFragment_1 = require("../fragments/PullRequestFragment");
const ReleaseFragment_1 = __importDefault(require("../fragments/ReleaseFragment"));
const RepositoryFragment_1 = __importDefault(require("../fragments/RepositoryFragment"));
const TagFragment_1 = __importDefault(require("../fragments/TagFragment"));
class RepositoryComponent extends Component_1.default {
    constructor(id) {
        super(id, "repository");
    }
    get fragments() {
        const fragments = new Set();
        if (this.includes.details)
            fragments.add(RepositoryFragment_1.default);
        if (this.includes.releases)
            fragments.add(ReleaseFragment_1.default);
        if (this.includes.stargazers)
            fragments.add(ActorFragment_1.SimplifiedActorFragment);
        if (this.includes.tags)
            fragments.add(CommitFragment_1.default).add(TagFragment_1.default);
        if (this.includes.watchers)
            fragments.add(ActorFragment_1.SimplifiedActorFragment);
        if (this.includes.issues)
            fragments.add(IssueFragment_1.SimplifiedIssueFragment);
        if (this.includes.pull_requests)
            fragments.add(PullRequestFragment_1.SimplifiedPullRequest);
        return [...fragments];
    }
    includeDetails(include = true) {
        this.includes.details = include && {
            textFragment: `...${RepositoryFragment_1.default.code}`,
        };
        return this;
    }
    includeLanguages(include = true, { first, after, alias = "_languages" }) {
        this.includes.languages = include && {
            textFragment: `
        ${alias}:languages(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          edges { language:node { name } size }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeTopics(include = true, { first, after, alias = "_topics" }) {
        this.includes.topics = include && {
            textFragment: `
        ${alias}:repositoryTopics(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { topic { name } }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeReleases(include = true, { first, after, alias = "_releases" }) {
        const args = super.argsToString({ first, after });
        this.includes.releases = include && {
            textFragment: `
        ${alias}:releases(${args}, orderBy: { field: CREATED_AT, direction: ASC  }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${ReleaseFragment_1.default.code} }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeTags(include = true, { first, after, alias = "_tags" }) {
        const args = super.argsToString({ first, after });
        this.includes.tags = include && {
            textFragment: `
        ${alias}:refs(refPrefix:"refs/tags/", ${args}, direction: ASC) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id name
            target { type:__typename id oid ...${CommitFragment_1.default.code} ...${TagFragment_1.default.code} }
          }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeStargazers(include = true, { first, after, alias = "_stargazers" }) {
        const args = super.argsToString({ first, after });
        this.includes.stargazers = include && {
            textFragment: `
        ${alias}:stargazers(${args}, orderBy: { direction: ASC, field: STARRED_AT }) {
            pageInfo { hasNextPage endCursor }
            edges { starredAt user:node { ...${ActorFragment_1.SimplifiedActorFragment.code} } }
          }
      `,
            first,
            after,
        };
        return this;
    }
    includeWatchers(include = true, { first, after, alias = "_watchers" }) {
        this.includes.watchers = include && {
            textFragment: `
        ${alias}:watchers(${super.argsToString({ first, after })}) {
            pageInfo { hasNextPage endCursor }
            nodes { ...${ActorFragment_1.SimplifiedActorFragment.code} }
          }
      `,
            first,
            after,
        };
        return this;
    }
    includeDependencyManifests(include = true, { first, after, alias = "_manifests" }) {
        this.includes.dependencies = include && {
            textFragment: `
        ${alias}:dependencyGraphManifests(${super.argsToString({
                after,
                first,
            })}) {
          pageInfo { hasNextPage endCursor }
          nodes { dependenciesCount exceedsMaxSize filename id parseable }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeIssues(include = true, { after, first = 100, alias = "_issues" }) {
        const args = super.argsToString({ after, first });
        this.includes.issues = include && {
            textFragment: `
        ${alias}:issues(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${IssueFragment_1.SimplifiedIssueFragment.code} }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includePullRequests(include = true, { after, first = 100, alias = "_pullRequests" }) {
        const args = super.argsToString({ after, first });
        this.includes.pull_requests = include && {
            textFragment: `
        ${alias}:pullRequests(${args}, orderBy: { field: UPDATED_AT, direction: ASC }) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${PullRequestFragment_1.SimplifiedPullRequest.code} }
        }
      `,
            first,
            after,
        };
        return this;
    }
    toString() {
        let text = "";
        const textFragments = Object.values(this.includes)
            .filter((i) => i)
            .map((i) => i && i.textFragment)
            .join("\n");
        if (textFragments) {
            text += `
      ${this.alias}:node(id: "${this.id}") {
        ... on Repository {
          ${textFragments}
        }
      }
      `;
        }
        return text;
    }
}
exports.default = RepositoryComponent;
//# sourceMappingURL=RepositoryComponent.js.map
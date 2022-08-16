"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AutomaticBaseChangeFailedEvent_1 = __importDefault(require("../fragments/events/AutomaticBaseChangeFailedEvent"));
const AutomaticBaseChangeSucceededEvent_1 = __importDefault(require("../fragments/events/AutomaticBaseChangeSucceededEvent"));
const AutoMergeDisabledEvent_1 = __importDefault(require("../fragments/events/AutoMergeDisabledEvent"));
const AutoMergeEnabledEvent_1 = __importDefault(require("../fragments/events/AutoMergeEnabledEvent"));
const AutoRebaseEnabledEvent_1 = __importDefault(require("../fragments/events/AutoRebaseEnabledEvent"));
const AutoSquashEnabledEvent_1 = __importDefault(require("../fragments/events/AutoSquashEnabledEvent"));
const BaseRefChangedEvent_1 = __importDefault(require("../fragments/events/BaseRefChangedEvent"));
const BaseRefDeletedEvent_1 = __importDefault(require("../fragments/events/BaseRefDeletedEvent"));
const BaseRefForcePushedEvent_1 = __importDefault(require("../fragments/events/BaseRefForcePushedEvent"));
const ConvertToDraftEvent_1 = __importDefault(require("../fragments/events/ConvertToDraftEvent"));
const DeployedEvent_1 = __importDefault(require("../fragments/events/DeployedEvent"));
const DeploymentEnvironmentChangedEvent_1 = __importDefault(require("../fragments/events/DeploymentEnvironmentChangedEvent"));
const HeadRefDeletedEvent_1 = __importDefault(require("../fragments/events/HeadRefDeletedEvent"));
const HeadRefForcePushedEvent_1 = __importDefault(require("../fragments/events/HeadRefForcePushedEvent"));
const HeadRefRestoredEvent_1 = __importDefault(require("../fragments/events/HeadRefRestoredEvent"));
const MergedEvent_1 = __importDefault(require("../fragments/events/MergedEvent"));
const ReadyForReviewEvent_1 = __importDefault(require("../fragments/events/ReadyForReviewEvent"));
const ReviewDismissedEvent_1 = __importDefault(require("../fragments/events/ReviewDismissedEvent"));
const ReviewRequestedEvent_1 = __importDefault(require("../fragments/events/ReviewRequestedEvent"));
const ReviewRequestRemovedEvent_1 = __importDefault(require("../fragments/events/ReviewRequestRemovedEvent"));
const IssueFragment_1 = __importDefault(require("../fragments/IssueFragment"));
const PullRequestCommitCommentThreadFragment_1 = __importDefault(require("../fragments/PullRequestCommitCommentThreadFragment"));
const PullRequestCommitFragment_1 = __importDefault(require("../fragments/PullRequestCommitFragment"));
const PullRequestFragment_1 = __importDefault(require("../fragments/PullRequestFragment"));
const PullRequestReviewFragment_1 = __importDefault(require("../fragments/PullRequestReviewFragment"));
const PullRequestReviewThreadFragment_1 = __importDefault(require("../fragments/PullRequestReviewThreadFragment"));
const PullRequestRevisionMarkerFragment_1 = __importDefault(require("../fragments/PullRequestRevisionMarkerFragment"));
const IssueComponent_1 = __importDefault(require("./IssueComponent"));
class PullRequestComponent extends IssueComponent_1.default {
    constructor(id, alias = "pull") {
        super(id, alias);
        this.componentName = "PullRequest";
        this.extraTimelineEvents = `
      ... on AutomaticBaseChangeFailedEvent { ...${AutomaticBaseChangeFailedEvent_1.default.code} }
      ... on AutomaticBaseChangeSucceededEvent { ...${AutomaticBaseChangeSucceededEvent_1.default.code} }
      ... on AutoMergeDisabledEvent { ...${AutoMergeDisabledEvent_1.default.code} }
      ... on AutoMergeEnabledEvent { ...${AutoMergeEnabledEvent_1.default.code} }
      ... on AutoRebaseEnabledEvent { ...${AutoRebaseEnabledEvent_1.default.code} }
      ... on AutoSquashEnabledEvent { ...${AutoSquashEnabledEvent_1.default.code} }
      ... on BaseRefChangedEvent { ...${BaseRefChangedEvent_1.default.code} }
      ... on BaseRefDeletedEvent { ...${BaseRefDeletedEvent_1.default.code} }
      ... on BaseRefForcePushedEvent { ...${BaseRefForcePushedEvent_1.default.code} }
      ... on ConvertToDraftEvent { ...${ConvertToDraftEvent_1.default.code} }
      ... on DeployedEvent { ...${DeployedEvent_1.default.code} }
      ... on DeploymentEnvironmentChangedEvent { ...${DeploymentEnvironmentChangedEvent_1.default.code} }
      ... on HeadRefDeletedEvent { ...${HeadRefDeletedEvent_1.default.code} }
      ... on HeadRefForcePushedEvent { ...${HeadRefForcePushedEvent_1.default.code} }
      ... on HeadRefRestoredEvent { ...${HeadRefRestoredEvent_1.default.code} }
      ... on MergedEvent { ...${MergedEvent_1.default.code} }
      ... on PullRequestCommit { ...${PullRequestCommitFragment_1.default.code} }
      ... on PullRequestCommitCommentThread { ...${PullRequestCommitCommentThreadFragment_1.default.code} }
      ... on PullRequestReview { ...${PullRequestReviewFragment_1.default.code} }
      ... on PullRequestReviewThread { ...${PullRequestReviewThreadFragment_1.default.code} }
      ... on PullRequestRevisionMarker { ...${PullRequestRevisionMarkerFragment_1.default.code} }
      ... on ReadyForReviewEvent { ...${ReadyForReviewEvent_1.default.code} }
      ... on ReviewDismissedEvent { ...${ReviewDismissedEvent_1.default.code} }
      ... on ReviewRequestRemovedEvent { ...${ReviewRequestRemovedEvent_1.default.code} }
      ... on ReviewRequestedEvent { ...${ReviewRequestedEvent_1.default.code} }
    `;
    }
    get fragments() {
        const fragments = super.fragments;
        if (this.includes.details)
            fragments.splice(fragments.indexOf(IssueFragment_1.default), 1, PullRequestFragment_1.default);
        if (this.includes.timeline) {
            fragments.push(AutomaticBaseChangeFailedEvent_1.default, AutomaticBaseChangeSucceededEvent_1.default, AutoMergeDisabledEvent_1.default, AutoMergeEnabledEvent_1.default, AutoRebaseEnabledEvent_1.default, AutoSquashEnabledEvent_1.default, BaseRefChangedEvent_1.default, BaseRefDeletedEvent_1.default, BaseRefForcePushedEvent_1.default, ConvertToDraftEvent_1.default, DeployedEvent_1.default, DeploymentEnvironmentChangedEvent_1.default, HeadRefDeletedEvent_1.default, HeadRefForcePushedEvent_1.default, HeadRefRestoredEvent_1.default, MergedEvent_1.default, PullRequestCommitFragment_1.default, PullRequestReviewFragment_1.default, PullRequestReviewThreadFragment_1.default, PullRequestRevisionMarkerFragment_1.default, ReadyForReviewEvent_1.default, ReviewDismissedEvent_1.default, ReviewRequestRemovedEvent_1.default, ReviewRequestedEvent_1.default, PullRequestCommitCommentThreadFragment_1.default);
        }
        return fragments;
    }
    includeDetails(include) {
        this.includes.details = include && {
            textFragment: `...${PullRequestFragment_1.default.code}`,
        };
        return this;
    }
}
exports.default = PullRequestComponent;
//# sourceMappingURL=PullRequestComponent.js.map
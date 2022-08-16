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
const AddedToProjectEvent_1 = __importDefault(require("../fragments/events/AddedToProjectEvent"));
const AssignedEvent_1 = __importDefault(require("../fragments/events/AssignedEvent"));
const ClosedEvent_1 = __importDefault(require("../fragments/events/ClosedEvent"));
const CommentDeletedEvent_1 = __importDefault(require("../fragments/events/CommentDeletedEvent"));
const ConnectedEvent_1 = __importDefault(require("../fragments/events/ConnectedEvent"));
const ConvertedNoteToIssueEvent_1 = __importDefault(require("../fragments/events/ConvertedNoteToIssueEvent"));
const CrossReferencedEvent_1 = __importDefault(require("../fragments/events/CrossReferencedEvent"));
const DemilestonedEvent_1 = __importDefault(require("../fragments/events/DemilestonedEvent"));
const DisconnectedEvent_1 = __importDefault(require("../fragments/events/DisconnectedEvent"));
const LabeledEvent_1 = __importDefault(require("../fragments/events/LabeledEvent"));
const LockedEvent_1 = __importDefault(require("../fragments/events/LockedEvent"));
const MarkedAsDuplicateEvent_1 = __importDefault(require("../fragments/events/MarkedAsDuplicateEvent"));
const MentionedEvent_1 = __importDefault(require("../fragments/events/MentionedEvent"));
const MilestonedEvent_1 = __importDefault(require("../fragments/events/MilestonedEvent"));
const MovedColumnsInProjectEvent_1 = __importDefault(require("../fragments/events/MovedColumnsInProjectEvent"));
const PinnedEvent_1 = __importDefault(require("../fragments/events/PinnedEvent"));
const ReferencedEvent_1 = __importDefault(require("../fragments/events/ReferencedEvent"));
const RemovedFromProjectEvent_1 = __importDefault(require("../fragments/events/RemovedFromProjectEvent"));
const RenamedTitleEvent_1 = __importDefault(require("../fragments/events/RenamedTitleEvent"));
const ReopenedEvent_1 = __importDefault(require("../fragments/events/ReopenedEvent"));
const SubscribedEvent_1 = __importDefault(require("../fragments/events/SubscribedEvent"));
const TransferredEvent_1 = __importDefault(require("../fragments/events/TransferredEvent"));
const UnassignedEvent_1 = __importDefault(require("../fragments/events/UnassignedEvent"));
const UnlabeledEvent_1 = __importDefault(require("../fragments/events/UnlabeledEvent"));
const UnlockedEvent_1 = __importDefault(require("../fragments/events/UnlockedEvent"));
const UnmarkedAsDuplicateEvent_1 = __importDefault(require("../fragments/events/UnmarkedAsDuplicateEvent"));
const UnpinnedEvent_1 = __importDefault(require("../fragments/events/UnpinnedEvent"));
const UnsubscribedEvent_1 = __importDefault(require("../fragments/events/UnsubscribedEvent"));
const UserBlockedEvent_1 = __importDefault(require("../fragments/events/UserBlockedEvent"));
const IssueCommentFragment_1 = __importDefault(require("../fragments/IssueCommentFragment"));
const IssueFragment_1 = __importDefault(require("../fragments/IssueFragment"));
class IssueComponent extends Component_1.default {
    constructor(id, alias = "issue") {
        super(id, alias);
        this.componentName = "Issue";
        this.extraTimelineEvents = "";
    }
    get fragments() {
        const fragments = new Set();
        if (this.includes.details)
            fragments.add(IssueFragment_1.default);
        if (this.includes.assignees)
            fragments.add(ActorFragment_1.SimplifiedActorFragment);
        if (this.includes.participants)
            fragments.add(ActorFragment_1.SimplifiedActorFragment);
        if (this.includes.timeline) {
            fragments
                .add(AddedToProjectEvent_1.default)
                .add(AssignedEvent_1.default)
                .add(ClosedEvent_1.default)
                .add(CommentDeletedEvent_1.default)
                .add(ConnectedEvent_1.default)
                .add(ConvertedNoteToIssueEvent_1.default)
                .add(CrossReferencedEvent_1.default)
                .add(DemilestonedEvent_1.default)
                .add(DisconnectedEvent_1.default)
                .add(LabeledEvent_1.default)
                .add(LockedEvent_1.default)
                .add(MarkedAsDuplicateEvent_1.default)
                .add(MentionedEvent_1.default)
                .add(MilestonedEvent_1.default)
                .add(MovedColumnsInProjectEvent_1.default)
                .add(PinnedEvent_1.default)
                .add(ReferencedEvent_1.default)
                .add(RemovedFromProjectEvent_1.default)
                .add(RenamedTitleEvent_1.default)
                .add(ReopenedEvent_1.default)
                .add(SubscribedEvent_1.default)
                .add(TransferredEvent_1.default)
                .add(UnassignedEvent_1.default)
                .add(UnlabeledEvent_1.default)
                .add(UnlockedEvent_1.default)
                .add(UnmarkedAsDuplicateEvent_1.default)
                .add(UnpinnedEvent_1.default)
                .add(UnsubscribedEvent_1.default)
                .add(UserBlockedEvent_1.default)
                .add(IssueCommentFragment_1.default);
        }
        return [...fragments];
    }
    includeDetails(include = true) {
        this.includes.details = include && {
            textFragment: `...${IssueFragment_1.default.code}`,
        };
        return this;
    }
    includeAssignees(include = true, { first = 100, after, alias = "assignees" }) {
        this.includes.assignees = include && {
            textFragment: `
        ${alias}:assignees(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeLabels(include = true, { first = 100, after, alias = "labels" }) {
        this.includes.labels = include && {
            textFragment: `
        ${alias}:labels(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes { name }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeParticipants(include = true, { first = 100, after, alias = "participants" }) {
        this.includes.participants = include && {
            textFragment: `
        ${alias}:participants(${super.argsToString({ first, after })}) {
          nodes { ...${ActorFragment_1.SimplifiedActorFragment.code} }
        }
      `,
            first,
            after,
        };
        return this;
    }
    includeTimeline(include = true, { first = 100, after, alias = "timeline" }) {
        this.includes.timeline = include && {
            textFragment: `
        ${alias}:timelineItems(${super.argsToString({ first, after })}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            type:__typename
            ... on Node { id }
            ... on AddedToProjectEvent { ...${AddedToProjectEvent_1.default.code} }
            ... on AssignedEvent { ...${AssignedEvent_1.default.code} }
            ... on ClosedEvent { ...${ClosedEvent_1.default.code} }
            ... on CommentDeletedEvent { ...${CommentDeletedEvent_1.default.code} }
            ... on ConnectedEvent { ...${ConnectedEvent_1.default.code} }
            ... on ConvertedNoteToIssueEvent { ...${ConvertedNoteToIssueEvent_1.default.code} }
            ... on CrossReferencedEvent { ...${CrossReferencedEvent_1.default.code} }
            ... on DemilestonedEvent { ...${DemilestonedEvent_1.default.code} }
            ... on DisconnectedEvent { ...${DisconnectedEvent_1.default.code} }
            ... on IssueComment { ...${IssueCommentFragment_1.default.code} }
            ... on LabeledEvent { ...${LabeledEvent_1.default.code} }
            ... on LockedEvent { ...${LockedEvent_1.default.code} }
            ... on MarkedAsDuplicateEvent { ...${MarkedAsDuplicateEvent_1.default.code} }
            ... on MentionedEvent { ...${MentionedEvent_1.default.code} }
            ... on MilestonedEvent { ...${MilestonedEvent_1.default.code} }
            ... on MovedColumnsInProjectEvent { ...${MovedColumnsInProjectEvent_1.default.code} }
            ... on PinnedEvent { ...${PinnedEvent_1.default.code} }
            ... on ReferencedEvent { ...${ReferencedEvent_1.default.code} }
            ... on RemovedFromProjectEvent { ...${RemovedFromProjectEvent_1.default.code} }
            ... on RenamedTitleEvent { ...${RenamedTitleEvent_1.default.code} }
            ... on ReopenedEvent { ...${ReopenedEvent_1.default.code} }
            ... on SubscribedEvent { ...${SubscribedEvent_1.default.code} }
            ... on TransferredEvent { ...${TransferredEvent_1.default.code} }
            ... on UnassignedEvent { ...${UnassignedEvent_1.default.code} }
            ... on UnlabeledEvent { ...${UnlabeledEvent_1.default.code} }
            ... on UnlockedEvent { ...${UnlockedEvent_1.default.code} }
            ... on UnmarkedAsDuplicateEvent { ...${UnmarkedAsDuplicateEvent_1.default.code} }
            ... on UnpinnedEvent { ...${UnpinnedEvent_1.default.code} }
            ... on UnsubscribedEvent { ...${UnsubscribedEvent_1.default.code} }
            ... on UserBlockedEvent { ...${UserBlockedEvent_1.default.code} }
            ${this.extraTimelineEvents}
          }
        }
      `,
            first,
            after,
        };
        return this;
    }
    toString() {
        const includeText = Object.values(this.includes)
            .filter((i) => i)
            .map((i) => i && i.textFragment)
            .join("\n");
        return `
      ${this.alias}:node(id: "${this.id}") {
        ... on ${this.componentName} {
          ${includeText}
        }
      }
    `;
    }
}
exports.default = IssueComponent;
//# sourceMappingURL=IssueComponent.js.map
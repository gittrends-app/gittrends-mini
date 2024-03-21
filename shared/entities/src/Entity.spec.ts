import { ZodType } from 'zod';

import { Entity, EntityValidationError } from './Entity';

describe('Entity', () => {
  it('should remove unknown fields', () => {
    const user = Entity.actor({ id: '1', __type: 'User', login: 'octocat', invalid_field: '' });
    expect(user).toEqual({ id: '1', __type: 'User', login: 'octocat' });
  });

  it('should throw an error when required field is not present', () => {
    expect(() => Entity.actor({ __type: 'User', login: 'octocat' })).toThrow(EntityValidationError);
  });

  it('should return undefined when type is not supported/recognized', () => {
    expect(Entity.getSchema('unknown')).toBeUndefined();
  });

  it('should find TimelineEvent validators', () => {
    expect(Entity.getSchema('AddedToProjectEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AssignedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutomaticBaseChangeFailedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutomaticBaseChangeSucceededEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutoMergeDisabledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutoMergeEnabledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutoRebaseEnabledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('AutoSquashEnabledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('BaseRefChangedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('BaseRefDeletedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('BaseRefForcePushedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ClosedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('CommentDeletedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('CommitComment')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ConnectedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ConvertedNoteToIssueEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ConvertedToDiscussionEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ConvertToDraftEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('CrossReferencedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('DemilestonedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('DeployedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('DeploymentEnvironmentChangedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('DisconnectedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('HeadRefDeletedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('HeadRefForcePushedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('HeadRefRestoredEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('IssueComment')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('LabeledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('LockedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('MarkedAsDuplicateEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('MentionedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('MergedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('MilestonedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('MovedColumnsInProjectEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PinnedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestCommit')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestCommitCommentThread')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestReview')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestReviewComment')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestReviewThread')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('PullRequestRevisionMarker')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReadyForReviewEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReferencedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('RemovedFromProjectEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('RenamedTitleEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReopenedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReviewDismissedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReviewRequestedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('ReviewRequestRemovedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('SubscribedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('TransferredEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnassignedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnlabeledEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnlockedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnmarkedAsDuplicateEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnpinnedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UnsubscribedEvent')).toBeInstanceOf(ZodType);
    expect(Entity.getSchema('UserBlockedEvent')).toBeInstanceOf(ZodType);
  });
});

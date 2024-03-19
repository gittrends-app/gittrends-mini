import { ZodError, z } from 'zod';

import { Entity, EntityTypeError, EntityValidationError } from './Entity';
import { Actor } from './validators/Actor';

describe('Entity', () => {
  it('should remove unknown fields', () => {
    const user = new Entity<Actor>({ id: '1', type: 'User', login: 'octocat', invalid_field: '' });
    expect(user.data).toEqual({ id: '1', type: 'User', login: 'octocat' });
  });

  it('toJSON should return a clone of the data', () => {
    const user = new Entity<Actor>({ id: '1', type: 'User', login: 'octocat' });
    expect(user.toJSON()).toEqual({ id: '1', type: 'User', login: 'octocat' });
  });

  it('should throw an error when required field is not present', () => {
    expect(() => new Entity({ type: 'User', login: 'octocat' })).toThrow(EntityValidationError);
  });

  it('should throw an error when type is not recognized', () => {
    const func = () => new Entity({ type: 'unknown' });
    expect(func).toThrow(EntityTypeError);
    expect(func).not.toThrow(ZodError);
  });

  it('should find TimelineEvent validators', () => {
    expect(Entity.getSchemaValidator('AddedToProjectEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AssignedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutomaticBaseChangeFailedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutomaticBaseChangeSucceededEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutoMergeDisabledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutoMergeEnabledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutoRebaseEnabledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('AutoSquashEnabledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('BaseRefChangedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('BaseRefDeletedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('BaseRefForcePushedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ClosedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('CommentDeletedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('CommitComment')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ConnectedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ConvertedNoteToIssueEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ConvertedToDiscussionEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ConvertToDraftEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('CrossReferencedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('DemilestonedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('DeployedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('DeploymentEnvironmentChangedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('DisconnectedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('HeadRefDeletedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('HeadRefForcePushedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('HeadRefRestoredEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('IssueComment')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('LabeledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('LockedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('MarkedAsDuplicateEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('MentionedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('MergedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('MilestonedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('MovedColumnsInProjectEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PinnedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestCommit')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestCommitCommentThread')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestReview')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestReviewComment')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestReviewThread')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('PullRequestRevisionMarker')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReadyForReviewEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReferencedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('RemovedFromProjectEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('RenamedTitleEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReopenedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReviewDismissedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReviewRequestedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('ReviewRequestRemovedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('SubscribedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('TransferredEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnassignedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnlabeledEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnlockedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnmarkedAsDuplicateEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnpinnedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UnsubscribedEvent')).toBeInstanceOf(z.ZodType);
    expect(Entity.getSchemaValidator('UserBlockedEvent')).toBeInstanceOf(z.ZodType);
  });
});

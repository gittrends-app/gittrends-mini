import { TimelineEvent } from './TimelineEvent';
import ClosedEvent from './TimelineEvent/ClosedEvent';

it('should validate TimelineEntity entity', () => {
  const data: Record<string, any> = { id: 'id', repository: 'repo', issue: 'issue' };
  expect(() => TimelineEvent.validate(data)).toThrowError();

  data.type = 'ClosedEvent';
  expect(() => TimelineEvent.validate(data)).not.toThrowError();
  expect(TimelineEvent.validate(data)).toEqual(data);

  expect(TimelineEvent.validate({ ...data, toBe: 'removed' })).toEqual(data);
});

it('should validate ClosedEvent entity', () => {
  const data = { id: 'id', repository: 'repo', issue: 'issue', type: 'ClosedEvent', created_at: new Date() };
  const validate = () => TimelineEvent.from(data);
  expect(validate).not.toThrowError();
  expect(validate()).toBeInstanceOf(ClosedEvent);
  expect(validate()).toEqual(data);
});

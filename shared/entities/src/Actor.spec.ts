import Joi from 'joi';

import { Actor, Organization, User } from './Actor';

it('should validate simple Actor entity', () => {
  const value = Actor.validate({ id: 'custom_id', login: 'login', type: 'Bot', additional: 1 });
  expect(value).toStrictEqual({ id: 'custom_id', login: 'login', type: 'Bot' });
});

it('should not validate Actor entity when missing required fields', () => {
  const validate = () => Actor.validate({ login: 'login', type: 'Bot', additional: 1 });
  expect(validate).toThrowError(Joi.ValidationError);
});

it('should transform User entity', () => {
  const data = { id: 'custom_id', login: 'login', type: 'User', twitter_username: '@user' };
  const value = Actor.from(data);
  expect(value).toBeInstanceOf(User);
  expect(value).toEqual(data);
});

it('should transform Organization entity', () => {
  const data = { id: 'custom_id', login: 'login', type: 'Organization', teams: 9999 };
  const value = Actor.from(data);
  expect(value).toBeInstanceOf(Organization);
  expect(value).toEqual(data);
});

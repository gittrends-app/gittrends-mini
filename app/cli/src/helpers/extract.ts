import { isNil, isPlainObject, negate, uniqBy } from 'lodash';

import { Actor, ActorSchema, Reaction } from '@gittrends/entities';

const isNotNil = negate(isNil);

function extract<T>(data: any, test: (data: any) => boolean, replacement: (data: T) => any): T[] {
  const result = new Array<any>();
  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index++) {
      const _data = data[index];
      if (test(_data)) {
        result.push(_data);
        data[index] = replacement(_data);
      } else {
        result.push(...extract(_data, test, replacement));
      }
    }
  } else if (typeof data === 'object') {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (test(data[key])) {
        result.push(data[key]);
        data[key] = replacement(data[key]);
      } else {
        result.push(...extract(data[key], test, replacement));
      }
    }
  } else if (test(data)) {
    result.push(data);
  }
  return result;
}

function replace<T = Record<string, unknown>>(
  data: any,
  keyTest: (data: T) => boolean,
  replacement: (data: T) => any,
): number {
  let count = 0;
  if (Array.isArray(data)) {
    for (const item of data) {
      count += replace(item, keyTest, replacement);
    }
  } else if (typeof data === 'object') {
    for (const key of Object.keys(data)) {
      count += replace(data[key], keyTest, replacement);
    }
    if (keyTest(data)) {
      replacement(data);
      return 1;
    }
  }
  return count;
}

export function extractActors(data: any): Actor[] {
  return uniqBy(
    extract(
      data,
      (data) =>
        isNotNil(data) &&
        isPlainObject(data) &&
        isNotNil(data['__type']) &&
        Object.values(ActorSchema.shape.__type.enum).includes(data.__type),
      (data) => data.id,
    ),
    'id',
  );
}

export function extractReactions(data: any): Reaction[] {
  const reactions = extract<Reaction>(
    data,
    (data) => isNotNil(data) && isPlainObject(data) && data['__type'] === 'Reaction',
    (data) => data.id,
  );
  replace(
    data,
    (data) => {
      const keys = Object.keys(data);
      return keys.includes('reaction_groups') && keys.includes('reactions') && Array.isArray(data.reactions);
    },
    (d) =>
      (d.reactions = Object.entries(d.reaction_groups as Record<string, number>).reduce(
        (acc, [, value]) => acc + value,
        0,
      )),
  );
  return reactions;
}

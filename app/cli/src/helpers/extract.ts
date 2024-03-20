import { isNil, negate } from 'lodash';

import { Actor, ActorSchema, Reaction } from '@gittrends/entities';

const isNotNil = negate(isNil);

function extract<T>(data: any, test: (data: any) => boolean): T[] {
  const result = new Array<any>();
  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index++) {
      const _data = data[index];
      if (test(_data)) {
        result.push(_data);
        data[index] = _data.id;
      } else {
        result.push(...extract(_data, test));
      }
    }
  } else if (typeof data === 'object') {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (test(data[key])) {
        result.push(data[key]);
        data[key] = data[key].id;
      } else {
        result.push(...extract(data[key], test));
      }
    }
  } else if (test(data)) {
    result.push(data);
  }
  return result;
}

export function extractActors(data: any): Actor[] {
  const fields = ['id', 'type'];
  return extract(
    data,
    (data) =>
      isNotNil(data) &&
      fields.every((field) => isNotNil(data[field])) &&
      Object.values(ActorSchema.shape.type.enum).includes(data.type),
  );
}

export function extractReactions(data: any): Reaction[] {
  const fields = ['id', 'repository', 'reactable', 'reactable_type', 'content'];
  return extract(data, (data) => isNotNil(data) && fields.every((field) => isNotNil(data[field])));
}

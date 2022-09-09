import { isNil, mapValues, omitBy } from 'lodash';

import { Entity } from '@gittrends/lib/dist';

export function transform<T extends Entity>(data: T): Record<string, unknown> {
  return mapValues(omitBy(data, isNil), (value) => {
    if (value === true) return 'TRUE';
    else if (value === false) return 'FALSE';
    else return value;
  });
}

export function parse<T extends Record<string, unknown>>(data: T): T {
  return mapValues(omitBy(data, isNil), (value) => {
    if (value === 'TRUE') return true;
    else if (value === 'FALSE') return false;
    else return value;
  }) as T;
}

import { Node } from '@gittrends/entities';

export function extractEntityInstances<T extends Node>(data: any, Instance: new (...args: any[]) => T): T[] {
  const actors = new Array<T>();
  if (Array.isArray(data)) {
    for (let index = 0; index < data.length; index++) {
      const _data = data[index];
      if (_data instanceof Instance) {
        actors.push(_data);
        data[index] = _data.id;
      } else {
        actors.push(...extractEntityInstances(_data, Instance));
      }
    }
  } else if (typeof data === 'object') {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (data[key] instanceof Instance) {
        actors.push(data[key]);
        data[key] = data[key].id;
      } else {
        actors.push(...extractEntityInstances(data[key], Instance));
      }
    }
  } else if (data instanceof Instance) {
    actors.push(data);
  }
  return actors;
}

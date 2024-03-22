import { default as deb } from 'debug';

export function debug(namespace: string) {
  return deb(`gittrends:${namespace}`);
}

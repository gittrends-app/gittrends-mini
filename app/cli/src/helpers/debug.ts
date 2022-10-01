import debug from 'debug';

export default function (namespace: string) {
  return debug(`gittrends:${namespace}`);
}

import axios from 'axios';

import { CacheAPI } from './services/CacheAPI';

export { CacheAPI } from './services/CacheAPI';

export function createClient(opts: { host: string; port: number }): CacheAPI {
  const client = axios.create({
    baseURL: `http://${opts.host}:${opts.port}`,
    validateStatus(status) {
      return /(2\d{2}|404)/gi.test(status.toString());
    },
  });

  return {
    async add(key: string, data: string | Buffer, expires?: string | number): Promise<void> {
      const { status } = await client.post('/', { key, data: data.toString(), expires });
      if (status !== 201) throw new Error(`Key could not be inserted! (status code: ${status})`);
    },

    async get(key: string): Promise<string | Buffer | undefined> {
      return client.get('/', { params: { key } }).then(({ data }) => data.data);
    },

    async delete(key: string): Promise<boolean> {
      const { status } = await client.delete('/', { params: { key } });
      if (status !== 200) throw new Error(`Key could not be inserted! (status code: ${status})`);
      else return true;
    },
  };
}

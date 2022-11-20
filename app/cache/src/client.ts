import axios from 'axios';

export interface CacheClientAPI {
  add(key: string, value: string | Buffer): Promise<void>;
  get(key: string): Promise<string | Buffer | undefined>;
  delete(key: string): Promise<boolean>;
}

export function createClient(opts: { host: string; port: number }): CacheClientAPI {
  const client = axios.create({
    baseURL: `http://${opts.host}:${opts.port}`,
    validateStatus(status) {
      return /(2\d{2}|404)/gi.test(status.toString());
    },
  });

  return {
    async add(key: string, data: string | Buffer): Promise<void> {
      const { status } = await client.post('/', { key, data });
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
